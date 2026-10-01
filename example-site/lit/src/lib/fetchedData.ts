import type { ReactiveControllerHost } from 'lit'

/*
 * One place for a page to ask for something it needs before it can draw.
 *
 * The stores below live for the whole visit, so moving back to a page already
 * seen draws it at once without asking the meal database again. A reload starts
 * them empty.
 */

const answers = new Map<string, unknown>()
const failures = new Map<string, unknown>()
/** A page element, which the store can ask to redraw. */
type Page = ReactiveControllerHost & Element

/** The pages to redraw when each request still under way finishes, by key. */
const pagesWaiting = new Map<string, Set<Page>>()

/** Where a request stands, as a page draws it. */
export type FetchedData<TData> =
	| { status: 'waiting' }
	| {
			status: 'failed'
			/** Forgets the failure and asks again. */
			tryAgain: () => void
	  }
	| { status: 'ready'; data: TData }

interface GetFetchedDataParams<TData> {
	/**
	 * Names what is being asked for, so two pages wanting the same thing share
	 * one request. Include anything that changes the answer, such as the
	 * category's name.
	 */
	key: string
	/** Fetches it. Called only when nothing is known yet. */
	load: () => Promise<TData>
	/** The page asking, which is redrawn when the answer arrives if it is still on screen. */
	page: Page
}

/**
 * Hands back what was asked for if it has arrived, and otherwise starts asking
 * and says the page is waiting.
 *
 * Called while the page draws. A page that moves from one key to another, such
 * as one category to the next, simply asks again with the new key: an older
 * request finishing only redraws the page, which then reads its current key and
 * finds it still waiting.
 *
 * A request that fails is remembered as a failure rather than tried again on the
 * next draw, so nothing keeps asking a meal database that is not answering. The
 * failure page's "Try again" is what asks again.
 */
export function getFetchedData<TData>({
	key,
	load,
	page,
}: GetFetchedDataParams<TData>): FetchedData<TData> {
	if (answers.has(key)) {
		return { status: 'ready', data: answers.get(key) as TData }
	}
	if (failures.has(key)) {
		const tryAgain = () => {
			failures.delete(key)
			page.requestUpdate()
		}
		return { status: 'failed', tryAgain }
	}
	if (!pagesWaiting.has(key)) startRequest(key, load)
	pagesWaiting.get(key)?.add(page)
	return { status: 'waiting' }
}

/**
 * Asks for one thing, stores the answer or the failure under its key, and
 * redraws every page that was waiting for it and is still on screen.
 *
 * A page the reader has already left is skipped, because drawing it would
 * still name the browser tab after it, over the page now showing. It draws
 * from the stored answer if the reader comes back.
 *
 * @param key - what the answer is stored under
 * @param load - fetches it
 */
function startRequest(key: string, load: () => Promise<unknown>) {
	pagesWaiting.set(key, new Set())
	load()
		.then(
			(answer) => answers.set(key, answer),
			(failure: unknown) => {
				failures.set(key, failure)
				// The failure page names no cause, so this is where to find it.
				console.error(`Asking the meal database for "${key}" failed:`, failure)
			},
		)
		.finally(() => {
			const pagesToRedraw = pagesWaiting.get(key)
			pagesWaiting.delete(key)
			pagesToRedraw?.forEach((page) => {
				if (page.isConnected) page.requestUpdate()
			})
		})
}
