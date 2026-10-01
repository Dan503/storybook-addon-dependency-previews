/*
 * The one place that says the address on screen has changed, for anything that
 * draws differently depending on it.
 *
 * The router redraws only the element holding it, and that element hands the
 * page it draws nothing but the pieces of the address. Anything further in that
 * reads the address itself, such as the nav marking the current section, would
 * otherwise be left showing the old one whenever the page it sits in is kept
 * rather than replaced.
 *
 * A page is kept whenever two addresses lead to the same kind of page. Most
 * such moves leave the nav as it was — one category to another stays under
 * "Food categories" — but two addresses the site does not have both lead to
 * the one not-found page, and they can differ: `/categories/a/b` sits under
 * "Food categories" and `/nowhere` under nothing, so moving between them with
 * back and forward needs the nav told.
 */

const listeners = new Set<() => void>()

/** Tells everything listening that the address has changed. Called by the site element after each move. */
export function announceAddressChange() {
	listeners.forEach((onChange) => onChange())
}

/**
 * Runs `onChange` each time the address changes, until the function handed
 * back is called.
 *
 * @param onChange - what to run after each move
 */
export function listenForAddressChange(onChange: () => void): () => void {
	listeners.add(onChange)
	return () => listeners.delete(onChange)
}
