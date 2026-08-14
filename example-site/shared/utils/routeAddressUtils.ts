/**
 * The addresses the example sites link to.
 *
 * The sites are meant to share one set of addresses, so this list is the one
 * place they are written down. Solid is the site that imports it. React and
 * Svelte sit on the same addresses but each reads them from the list its own
 * router generates, so neither needs anything from here. Vue and Angular are
 * being moved onto these addresses one at a time, so for now a few of their
 * pages are still at addresses that are not in this list.
 *
 * Adding a page to a site means adding its address here — nothing checks that
 * automatically for the sites whose framework generates no list of its own.
 *
 * Each address is spelled out in full rather than written as a fixed start plus
 * free text, because an address that is only partly written out is never offered
 * as an autocomplete option. A `$name` stands in for a piece that changes, which
 * is how the React site's router writes them; the other frameworks mark them
 * differently in their own route files, and that spelling is theirs to choose.
 */
export type RouteAddress =
	| '/'
	| '/categories'
	| '/categories/$category'
	| '/meal/$mealId'
	| '/contact'

/** The name after the `$` in each address that has a changing piece. */
export type HrefParamName = 'category' | 'mealId'

/**
 * The pieces that complete an address, looked up by name.
 *
 * Every entry is optional because an address needs only its own piece — there
 * is no address that takes both.
 */
export type HrefParams = Partial<Record<HrefParamName, string>>

/**
 * Where a link points: an address, plus the pieces that complete it.
 *
 * The two are separate props so that the sites' link components stay a plain
 * set of props rather than a set of alternatives, which is what Storybook needs
 * to work out a story's arguments. So the type checks the piece *names* but not
 * the pairing: it cannot say that `/meal/$mealId` in particular must be given a
 * `mealId`. `getFullAddress` checks that when it builds the address.
 */
export interface LinkAddress {
	/**
	 * The page to link to, written the way it appears in `RouteAddress`. A
	 * `$name` in it stands for a piece that changes and has to be supplied in
	 * `hrefParams`.
	 */
	href: RouteAddress
	/**
	 * The pieces that complete the address, looked up by the name after the `$`.
	 * An address with no `$name` in it needs none of these. Leaving out a piece
	 * an address does need throws when the link is drawn — the type cannot catch
	 * it, because it does not tie the two together.
	 */
	hrefParams?: HrefParams
}

/**
 * Fills an address's changing pieces in and hands back the address to link to.
 *
 * Each piece is escaped, so a page reading one back needs to unescape it to get
 * the original text. Escaping leaves digits alone, which is why a page whose
 * piece is always a number can read it back as it stands.
 *
 * An address with a `$name` in it that was given no matching piece throws, and
 * so does one given an empty piece, since both build a link that quietly points
 * at the wrong page.
 */
export function getFullAddress({ href, hrefParams }: LinkAddress): string {
	const changingPiece = /\$(\w+)/g
	// A Map rather than the object itself, so a piece named after something every
	// object inherits (`constructor`, `toString`) reads as absent rather than
	// picking up the inherited value.
	const pieceValues = new Map(Object.entries(hrefParams ?? {}))
	return href.replace(changingPiece, (marker, pieceName: string) => {
		const pieceValue = pieceValues.get(pieceName)
		if (!pieceValue) {
			const message = getUnusablePieceMessage(
				href,
				marker,
				pieceName,
				pieceValues,
			)
			throw new Error(message)
		}
		return encodeURIComponent(pieceValue)
	})
}

/**
 * Says why a changing piece could not be used, for the error `getFullAddress`
 * throws. The name being present but empty is worth telling apart from it being
 * absent, because the two are fixed in different places.
 *
 * @param href - the address being built, quoted back in the message
 * @param marker - the piece as it appears in the address, like `$mealId`
 * @param pieceName - the same piece without the `$`, like `mealId`
 * @param pieceValues - the pieces the caller passed, by name
 */
function getUnusablePieceMessage(
	href: string,
	marker: string,
	pieceName: string,
	pieceValues: Map<string, string>,
): string {
	const isPieceBlank = pieceValues.get(pieceName) === ''
	if (isPieceBlank) {
		return `The address "${href}" was given an empty ${marker}, which would link to the wrong page.`
	}
	// A name carrying no value does not count as given. Listing it would point
	// the reader at a name that is already there, rather than at the value.
	const namesGiven = [...pieceValues]
		.filter(([, pieceValue]) => pieceValue)
		.map(([name]) => name)
	const whatWasGiven = namesGiven.length
		? `only these were given: ${namesGiven.join(', ')}`
		: 'none were given'
	return `The address "${href}" needs a value for ${marker} in hrefParams, but ${whatWasGiven}.`
}
