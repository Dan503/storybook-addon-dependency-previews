/**
 * Every address the example sites have.
 *
 * All five sites use the same addresses, so this list is the one place they are
 * written down. Adding a page to a site means adding its address here — nothing
 * checks that automatically for the sites whose framework generates no list of
 * its own.
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

/**
 * Where a link points: an address, plus the pieces that complete it.
 *
 * The two are separate props so that the sites' link components stay a plain
 * set of props rather than a set of alternatives, which is what Storybook needs
 * to work out a story's arguments. Nothing in the type says that an address
 * with a `$name` in it must be given a matching piece, so `getFullAddress`
 * checks that when it builds the address.
 */
export interface LinkAddress {
	href: RouteAddress
	hrefParams?: Record<string, string>
}

/**
 * Fills an address's changing pieces in and hands back the address to link to.
 *
 * Every piece is escaped, so a page reading one back has to unescape it. An
 * address with a `$name` in it that was given no matching piece throws, since
 * the alternative is a link that quietly points at the wrong page.
 */
export function getFullAddress({ href, hrefParams }: LinkAddress): string {
	const changingPiece = /\$(\w+)/g
	const pieceValues: Record<string, string | undefined> = hrefParams ?? {}
	return href.replace(changingPiece, (marker, pieceName: string) => {
		const pieceValue = pieceValues[pieceName]
		if (!pieceValue) {
			const namesGiven = Object.keys(pieceValues)
			const whatWasGiven = namesGiven.length
				? `only these were given: ${namesGiven.join(', ')}`
				: 'none were given'
			throw new Error(
				`The address "${href}" needs a value for ${marker} in hrefParams, but ${whatWasGiven}.`,
			)
		}
		return encodeURIComponent(pieceValue)
	})
}
