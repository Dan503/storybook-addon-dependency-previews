/**
 * The addresses the example sites link to.
 *
 * The sites are meant to share one set of addresses, so this list is the one
 * place they are written down. React and Solid already sit on it; the Svelte,
 * Vue and Angular sites are being moved onto it one at a time, so for now a few
 * of their pages are still at addresses that are not in this list.
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
	href: RouteAddress
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
	const pieceValues: Record<string, string | undefined> = hrefParams ?? {}
	return href.replace(changingPiece, (marker, pieceName: string) => {
		const pieceValue = pieceValues[pieceName]
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
 */
function getUnusablePieceMessage(
	href: string,
	marker: string,
	pieceName: string,
	pieceValues: Record<string, string | undefined>,
): string {
	const hasEmptyValue = pieceName in pieceValues
	if (hasEmptyValue) {
		return `The address "${href}" was given an empty ${marker}, which would link to the wrong page.`
	}
	const namesGiven = Object.keys(pieceValues)
	const whatWasGiven = namesGiven.length
		? `only these were given: ${namesGiven.join(', ')}`
		: 'none were given'
	return `The address "${href}" needs a value for ${marker} in hrefParams, but ${whatWasGiven}.`
}
