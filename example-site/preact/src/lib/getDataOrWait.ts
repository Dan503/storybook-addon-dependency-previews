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
 * Pausing is done by throwing the unfinished request, which is the signal both
 * halves of this site already understand. While the pages are being built,
 * preact-iso draws through `renderToStringAsync`, which waits for a thrown
 * request and then draws again. In the browser, preact-iso's own `Router`
 * catches it, keeps the previous page on screen, and draws again once the
 * request finishes. So neither side needs anything wrapped around it.
 *
 * A request that fails is remembered as a failure and thrown again on the next
 * ask, rather than being retried. That is what makes a build stop and report an
 * unreachable meal database instead of asking it forever.
 *
 * @param key - names what is being asked for, so two pages wanting the same
 *   thing share one request; include anything that changes the answer
 * @param load - fetches it, called only when nothing is known yet
 */
export function getDataOrWait<TData>(
	key: string,
	load: () => Promise<TData>,
): TData {
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
	throw pending
}
