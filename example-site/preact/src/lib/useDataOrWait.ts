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

/**
 * Hands back what was asked for, or pauses the page until it arrives.
 *
 * Pausing is done by throwing the unfinished request, and **two** separate
 * things have to be in place for the page to come back afterwards. Both were
 * checked by taking each away in turn, and the page stays blank either way:
 *
 * 1. The page asks for its own redraw when the request finishes — the
 *    `useState` below. preact-iso's own `lazy` does exactly this, and without
 *    it nothing ever draws the page a second time.
 * 2. An `ErrorBoundary` sits above the router in `src/index.tsx`. It catches
 *    the thrown request and keeps what is on screen there in the meantime.
 *
 * While the pages are being built neither matters: `renderToStringAsync` waits
 * for a thrown request and draws again by itself. The redraw asked for here is
 * harmless there, because the page is finished by the time it could fire.
 *
 * A request that fails is remembered as a failure and thrown again on the next
 * ask, rather than being retried, so nothing keeps asking a meal database that
 * is not answering. What catches that throw differs by where the page is drawn,
 * and neither half is the `ErrorBoundary` in `src/index.tsx` — that one only
 * catches a *paused* page, because preact-iso builds it with no
 * `componentDidCatch` unless it is handed an `onError`, and preact treats a
 * component as an error boundary only when it carries that method or a
 * `getDerivedStateFromError`.
 *
 * While the pages are being built there is deliberately nothing to catch it:
 * the throw leaves `prerender` and the build stops and names the meal database,
 * rather than writing out a page saying the meals could not be loaded.
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
export function useDataOrWait<TData>(
	key: string,
	load: () => Promise<TData>,
): TData {
	const [, redraw] = useState(0)
	// Which key a redraw has been asked for, rather than merely whether one
	// has. Moving from one category to the next keeps the same page component
	// on screen — preact-iso reuses it when only the changing piece differs —
	// so a plain yes/no would be left over from the previous category and the
	// new one would never draw.
	const keyAwaitingRedraw = useRef<string | null>(null)

	if (failures.has(key)) throw failures.get(key)
	if (answers.has(key)) return answers.get(key) as TData

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

	// Asked for once per key, not once per draw, so a page that throws again
	// before its request finishes does not queue up a redraw each time.
	if (keyAwaitingRedraw.current !== key) {
		keyAwaitingRedraw.current = key
		pending.then(() => redraw((drawCount) => drawCount + 1))
	}

	throw pending
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
