/**
 * The addresses the example sites link to.
 *
 * The sites are meant to share one set of addresses, so this list is the one
 * place they are written down. Solid and Vue are the sites that import it.
 * React and Svelte sit on the same addresses but each reads them from the list
 * its own router generates, so neither needs anything from here. Angular is
 * still being moved onto these addresses, so for now a few of its pages are at
 * addresses that are not in this list.
 *
 * A site that uses this list has its addresses added here by hand, and how much
 * that buys depends on how much of the site goes through it. Solid puts every
 * internal link through the list, so a link to an address the list does not have
 * is refused; Vue only puts its card links through it, and its navigation links
 * are still free text. Either way a page nobody links to still slips by. Angular
 * will want the same care once it moves onto the list. React and Svelte read
 * their own generated lists, so their pages are not this list's concern.
 *
 * Each address is spelled out in full rather than written as a fixed start plus
 * free text, because an address that is only partly written out is never offered
 * as an autocomplete option.
 *
 * Every framework marks a changing piece its own way, so the marks that sit
 * either side of one are given as arguments and the same five addresses can be
 * had in any of those spellings. There is no default: a site says which
 * spelling it means.
 *
 * Prefer asking for a spelling by its name below to writing the marks out where
 * they are used. Either works, and both autocomplete — a name just reads better
 * at the point of use than a pair of marks does.
 */
export type RouteAddress<Before extends string, After extends string> =
	| '/'
	| '/categories'
	| `/categories/${RouteParam<Before, 'category', After>}`
	| `/meal/${RouteParam<Before, 'mealId', After>}`
	| '/contact'

/** A changing piece as one framework writes it: `$mealId`, `:mealId`, `[mealId]`. */
type RouteParam<
	Before extends string,
	Name extends string,
	After extends string,
> = `${Before}${Name}${After}`

function routeParam<
	Before extends string,
	Name extends string,
	After extends string,
>(before: Before, name: Name, after: After): RouteParam<Before, Name, After> {
	return `${before}${name}${after}`
}

/** The addresses with a `:` before each changing piece, as a router matches them. */
export type ColonRouteAddress = RouteAddress<':', ''>

/** The addresses with a `$` before each changing piece. */
export type DollarRouteAddress = RouteAddress<'$', ''>

/** The addresses with each changing piece in brackets, as file-based routing names them. */
export type BracketRouteAddress = RouteAddress<'[', ']'>

/**
 * Any of the spellings a site may pick.
 *
 * Private: it is only the bound on `LinkAddress` and the fillers, and a site
 * names the one spelling it uses rather than this. Declaration output keeps it
 * without needing it exported.
 */
type AnyRouteAddressStyle = RouteAddress<string, string>

/**
 * What one framework puts either side of a changing piece.
 *
 * `after` is empty for the spellings that mark only the front, like `$mealId`
 * and `:mealId`.
 */
export interface RouteMarks<Before extends string, After extends string> {
	before: Before
	after: After
}

/** The name of each changing piece an address can have. */
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
 * `mealId`. The filler checks that when it builds the address.
 *
 * The spelling is named rather than assumed, so a site passes the one it writes
 * its addresses in — `LinkAddress<BracketRouteAddress>` for a site whose pages
 * are files named `[mealId]`.
 */
export interface LinkAddress<RouteStyle extends AnyRouteAddressStyle> {
	/**
	 * The page to link to, written in this site's spelling. The marked-out name
	 * in it stands for a piece that changes and has to be supplied in
	 * `hrefParams`.
	 */
	href: RouteStyle
	/**
	 * The pieces that complete the address, looked up by the name inside the
	 * marks. An address with no changing piece needs none of these. Leaving out a
	 * piece an address does need throws when the link is drawn — the type cannot
	 * catch it, because it does not tie the two together.
	 */
	hrefParams?: HrefParams
}

/** Fills a link's address in, for addresses written in one particular spelling. */
type FillAddress<RouteStyle extends AnyRouteAddressStyle> = (
	linkAddress: LinkAddress<RouteStyle>,
) => string

/**
 * Builds a filler for addresses written in one framework's spelling.
 *
 * The marks are fixed when a filler is built rather than passed to each call. An
 * optional pair the caller could leave off would let the compiler read the
 * spelling off whichever address it was handed and accept it, and the filler
 * would then look for pieces marked a way that address does not use — finding
 * none, changing nothing, and handing back an address with its marks still in
 * it.
 *
 * What actually refuses a foreign spelling is the annotation on each of the
 * three fillers below, not anything in here: this function takes plain strings
 * and hands back something accepting any of the spellings. Keep those
 * annotations.
 *
 * @param marks - what this spelling puts either side of a changing piece
 */
function createAddressFiller<Before extends string, After extends string>(
	marks: RouteMarks<Before, After>,
) {
	const { before, after } = marks
	// Built once for the filler rather than per call. The marks are data now, and
	// some of them mean something in a search, so each is escaped first — left
	// raw, `$` matches the end of the address and `[` starts a set of characters.
	// A `:` needs no escaping, but the marks are not this function's to know.
	const changingPiece = new RegExp(
		`${escapeForSearch(before)}(\\w+)${escapeForSearch(after)}`,
		'g',
	)

	/**
	 * Fills an address's changing pieces in and hands back the address to link to.
	 *
	 * Each piece is escaped on the way in. Whether a page has to unescape it on
	 * the way out is its framework's business: vue-router and SvelteKit hand a
	 * page the original text already, so the Vue category page reads its piece
	 * straight, while a framework that passes the address through untouched needs
	 * the page to unescape it. Escaping leaves digits alone either way, which is
	 * why a piece that is always a number reads back the same everywhere.
	 *
	 * An address with a changing piece that was given no matching value throws,
	 * and so does one given an empty value, since both build a link that quietly
	 * points at the wrong page.
	 */
	return ({
		href,
		hrefParams,
	}: LinkAddress<RouteAddress<Before, After>>): string => {
		// A Map rather than the object itself, so a piece named after something
		// every object inherits (`constructor`, `toString`) reads as absent rather
		// than picking up the inherited value.
		const pieceValues = new Map(Object.entries(hrefParams ?? {}))
		return href.replace(changingPiece, (marker, pieceName: string) => {
			const pieceValue = pieceValues.get(pieceName)
			if (!pieceValue) {
				const message = getUnusablePieceMessage({
					href,
					marker,
					marks,
					pieceValues,
				})
				throw new Error(message)
			}
			return encodeURIComponent(pieceValue)
		})
	}
}

/** Fills in an address written with a `$` before each changing piece. */
export const getFullAddressViaDollars: FillAddress<DollarRouteAddress> =
	createAddressFiller({ before: '$', after: '' })

/** Fills in an address written with a `:` before each changing piece. */
export const getFullAddressViaColons: FillAddress<ColonRouteAddress> =
	createAddressFiller({ before: ':', after: '' })

/** Fills in an address written with each changing piece in brackets. */
export const getFullAddressViaBrackets: FillAddress<BracketRouteAddress> =
	createAddressFiller({ before: '[', after: ']' })

/**
 * Lists every address the sites share, written in one framework's spelling.
 *
 * A site needing the same addresses as its own router or route files write them
 * asks for them here rather than writing them out again, so the list cannot fall
 * behind the one above.
 *
 * @param marks - what this spelling puts either side of a changing piece
 */
export function generatePaths<Before extends string, After extends string>({
	before,
	after,
}: RouteMarks<Before, After>): Array<RouteAddress<Before, After>> {
	return [
		`/`,
		`/categories`,
		`/categories/${routeParam(before, 'category', after)}`,
		`/meal/${routeParam(before, 'mealId', after)}`,
		`/contact`,
	]
}

interface GetUnusablePieceMessageParams {
	/** the address being built, quoted back in the message */
	href: string
	/** the piece as it appears in the address, like `$mealId` or `[mealId]` */
	marker: string
	/** what this spelling puts either side of a changing piece */
	marks: RouteMarks<string, string>
	/** the pieces the caller passed, by name */
	pieceValues: Map<string, string>
}

/**
 * Says why a changing piece could not be used, for the error a filler throws.
 * The name being present but empty is worth telling apart from it being absent,
 * because the two are fixed in different places.
 */
function getUnusablePieceMessage({
	href,
	marker,
	marks,
	pieceValues,
}: GetUnusablePieceMessageParams): string {
	// The marker is the piece name with this spelling's marks around it, so the
	// name is what is left once they are taken off. Working it out from the marker
	// rather than taking it as its own argument means the two cannot be handed
	// over the wrong way round.
	const pieceName = marker.slice(
		marks.before.length,
		marker.length - marks.after.length,
	)
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

/**
 * Makes text safe to drop into a search, so each character stands for itself.
 *
 * Several of the marks a framework uses to set off a changing piece mean
 * something in a search — `$` matches the end of the text, and `[` and `]` bound
 * a set of characters — so without this a filler built for one of them looks for
 * the wrong thing. The two fail differently: an unescaped `$` finds no piece at
 * all, so an address comes back with its marks still in it and the link quietly
 * points at the wrong page, while an unescaped `[` becomes a set of characters
 * that matches almost anything, so it throws on every address carrying a letter
 * — every one of them except `/`. A `:` happens to be safe already; passing
 * every mark through here means no caller has to know which are which.
 *
 * @param text - the text to be searched for exactly as written
 */
function escapeForSearch(text: string): string {
	const charactersWithMeaning = /[.*+?^${}()|[\]\\]/g
	return text.replace(charactersWithMeaning, '\\$&')
}
