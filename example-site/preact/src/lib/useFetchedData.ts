import { useRef, useState } from 'preact/hooks'

/*
 * One place for a page to ask for something it needs before it can draw.
 *
 * The three stores below live for as long as the program does. While the pages
 * are being built that is one run of the build, which writes every page in a
 * single process, so a list fetched for one page is not fetched again for the
 * next. In the browser it is the visit, so moving back to a page already seen
 * draws it without asking again.
 */

const answers = new Map<string, unknown>()
const failures = new Map<string, unknown>()
const stillWaiting = new Map<string, Promise<unknown>>()

const isBuildingPages = typeof window === 'undefined'
// Read once, when the site starts, rather than on the first ask: the first page
// to ask is usually one the reader has just followed a link to, and reading the
// address then would mistake it for the page the site opened on.
const addressSiteOpenedAt = isBuildingPages ? '' : window.location.pathname
let isStillOnOpeningPage = !isBuildingPages

/** What a page asked for: either still on its way, or here. */
export type FetchedData<TData> =
	| { status: 'waiting' }
	| { status: 'ready'; data: TData }

/**
 * Hands back what was asked for, or says it is still on its way.
 *
 * A page still waiting draws its loading view, so following a link shows the
 * new page at once rather than leaving the old one on screen until the meals
 * arrive. When the request finishes, the page has to ask for its own redraw:
 * that is the `useState` below. Nothing else draws it a second time.
 *
 * Two places wait instead, by throwing the unfinished request rather than
 * answering "waiting":
 *
 * - While the pages are being built. `renderToStringAsync` waits for a thrown
 *   request and draws again by itself, so the written-out file has its meals in
 *   it rather than "Loading...". The redraw asked for here is harmless there,
 *   because the page is finished by the time it could fire.
 * - On the page the site opened on, until the reader leaves it or presses Try
 *   again. preact-iso's `Router` catches the thrown request and keeps what is
 *   on screen until it settles. For every page the build writes out, that is
 *   the written-out page, meals and all, and answering "waiting" would swap
 *   meals already on screen for "Loading..." while the browser fetched the
 *   same meals again. A meal page is not written out, so the host serves the
 *   home page's file in its place, and opening a meal's address keeps the home
 *   page on screen until the meal arrives, as it did before this helper
 *   answered "waiting" at all.
 *
 * A request that fails is remembered as a failure and thrown again on the next
 * ask, rather than being retried, so nothing keeps asking a meal database that
 * is not answering. What catches that throw differs by where the page is drawn,
 * and in neither case is it the router — the router only takes a thrown
 * *request*, because preact-iso hands it a thrown promise and nothing else.
 *
 * While the pages are being built there is deliberately nothing to catch it:
 * the throw leaves `prerender`, and the tool writing the pages reports it and
 * stops, rather than writing out a page saying the meals could not be loaded.
 * Checked by making one page's request fail during a build — it ends with the
 * failure reported and a non-zero exit.
 *
 * In the browser `PageFailureBoundary` catches it and draws the failure page,
 * which offers to try again — and trying again calls `forgetFailedRequests`
 * below, because a remembered failure would otherwise outlast the visit and a
 * reload would be the only way back.
 *
 * The two hooks are called before anything can throw, so a page always calls
 * the same hooks in the same order whether it is waiting or finished.
 *
 * Moving between two pages of the same shape — one category to the next — keeps
 * the same component on screen rather than building a new one, so the redraw is
 * tracked against the key it was asked for. Tracking merely *that* one was
 * asked for leaves the second category waiting forever behind the first one's
 * meals.
 *
 * @param key - names what is being asked for, so two pages wanting the same
 *   thing share one request; include anything that changes the answer
 * @param load - fetches it, called only when nothing is known yet
 */
export function useFetchedData<TData>(
	key: string,
	load: () => Promise<TData>,
): FetchedData<TData> {
	const [, redraw] = useState(0)
	// Which key a redraw has been asked for, rather than merely whether one
	// has. Moving from one category to the next keeps the same page component
	// on screen — preact-iso reuses it when only the changing piece differs —
	// so a plain yes/no would be left over from the previous category and the
	// new one would never draw.
	const keyAwaitingRedraw = useRef<string | null>(null)

	recordWhetherOpeningPageIsLeft()

	if (failures.has(key)) throw failures.get(key)
	if (answers.has(key)) {
		return { status: 'ready', data: answers.get(key) as TData }
	}

	let pending = stillWaiting.get(key)
	if (!pending) {
		pending = load().then(
			(answer) => {
				answers.set(key, answer)
				stillWaiting.delete(key)
			},
			(failure) => {
				failures.set(key, failure)
				stillWaiting.delete(key)
			},
		)
		stillWaiting.set(key, pending)
	}

	// Asked for once per key, not once per draw, so a page that draws again
	// before its request finishes does not queue up a redraw each time.
	if (keyAwaitingRedraw.current !== key) {
		keyAwaitingRedraw.current = key
		pending.then(() => redraw((drawCount) => drawCount + 1))
	}

	if (checkShouldHoldScreenWhileWaiting()) throw pending
	return { status: 'waiting' }
}

/**
 * Notes that the reader has left the page the site opened on, once the address
 * differs from the one it opened at. It stays noted, so coming back to that
 * address later is an ordinary move like any other.
 *
 * Read from the address here because the new page needs the answer while it
 * draws. The router's own "page changed" report notes it too, through
 * `recordOpeningPageReplaced`, but only once the new page has drawn.
 */
function recordWhetherOpeningPageIsLeft() {
	const hasAddressChanged =
		!isBuildingPages && window.location.pathname !== addressSiteOpenedAt
	if (hasAddressChanged) isStillOnOpeningPage = false
}

/**
 * Whether a page still waiting should keep what is on screen rather than draw
 * its loading view — see `useFetchedData` for the two places it does.
 */
function checkShouldHoldScreenWhileWaiting(): boolean {
	return isBuildingPages || isStillOnOpeningPage
}

/**
 * Whether the reader has moved on from the page the site opened on, or pressed
 * Try again. The failure page drawn on the first load does not count, even
 * though it replaces what was on screen.
 */
export function checkHasLeftOpeningPage(): boolean {
	return !isStillOnOpeningPage
}

/**
 * Notes that the page the site opened on has been replaced, so from now on a
 * page still waiting draws its loading view rather than keeping what is on
 * screen.
 *
 * Called by `handlePageReplaced` after every replacement. That covers a move
 * through a page that never asks through `useFetchedData`, such as the home
 * page, which `recordWhetherOpeningPageIsLeft` never sees — without it, coming
 * back to the opening address would still be treated as the first load.
 *
 * The failure page's try-again button also calls it, before the failure page
 * goes, because `handlePageReplaced` runs only after the new page has drawn.
 * Holding at that point would leave the site blank for as long as the request
 * takes rather than showing the page's loading view.
 */
export function recordOpeningPageReplaced() {
	isStillOnOpeningPage = false
}

/**
 * Forgets every request that failed, so the next ask tries again.
 *
 * Called by the failure page's try-again button. Without it a failed request is
 * remembered for the rest of the visit, so going back to the page would show
 * the same failure and only a reload would clear it.
 */
export function forgetFailedRequests() {
	failures.clear()
}
