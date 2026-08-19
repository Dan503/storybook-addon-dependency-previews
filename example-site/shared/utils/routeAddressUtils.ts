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
 * had in any of those spellings. Left off, they give `$name`, which is how the
 * React site's router writes them and how a link's address is written here.
 *
 * Prefer asking for a spelling by its name below to writing the marks out where
 * they are used. Either works, and both autocomplete — a name just says which
 * spelling is meant, and gives one place to change it if a framework's ever
 * does.
 */
export type RouteAddress<
	Before extends string = '$',
	After extends string = '',
> =
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

/** The addresses as a router matches them, with a `:` before each changing piece. */
export type RoutePattern = RouteAddress<':', ''>

/** The addresses as file-based routing names them, each changing piece in brackets. */
export type RouteFileName = RouteAddress<'[', ']'>

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
 * The marks are the same two arguments `RouteAddress` takes, so a site writing
 * its addresses in its own spelling passes them here as well.
 */
export interface LinkAddress<
	Before extends string = '$',
	After extends string = '',
> {
	/**
	 * The page to link to, written the way it appears in `RouteAddress`. The
	 * marked-out name in it stands for a piece that changes and has to be
	 * supplied in `hrefParams`.
	 */
	href: RouteAddress<Before, After>
	/**
	 * The pieces that complete the address, looked up by the name inside the
	 * marks. An address with no changing piece needs none of these. Leaving out a
	 * piece an address does need throws when the link is drawn — the type cannot
	 * catch it, because it does not tie the two together.
	 */
	hrefParams?: HrefParams
}

/**
 * Builds a filler for addresses written in one framework's spelling.
 *
 * The marks are fixed here rather than passed to each call on purpose. Were they
 * an argument the caller could leave off, the compiler would read the spelling
 * off whichever address it was handed and accept it, and the filler would then
 * look for pieces marked a way the address does not use — finding none, changing
 * nothing, and handing back an address with its marks still in it. Fixing them
 * here means a filler refuses an address in any other spelling outright.
 *
 * @param marks - what this spelling puts either side of a changing piece
 */
export function createAddressFiller<
	Before extends string,
	After extends string,
>(marks: RouteMarks<Before, After>) {
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
	 * Each piece is escaped, so a page reading one back needs to unescape it to
	 * get the original text. Escaping leaves digits alone, which is why a page
	 * whose piece is always a number can read it back as it stands.
	 *
	 * An address with a changing piece that was given no matching value throws,
	 * and so does one given an empty value, since both build a link that quietly
	 * points at the wrong page.
	 */
	return ({ href, hrefParams }: LinkAddress<Before, After>): string => {
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

/**
 * Fills in an address written the way a link's address is written here, with a
 * `$` before each changing piece.
 */
export const getFullAddress = createAddressFiller({ before: '$', after: '' })

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
 * points at the wrong page, while an unescaped `[` matches almost anything and
 * throws on every address. A `:` happens to be safe already; passing every mark
 * through here means no caller has to know which are which.
 *
 * @param text - the text to be searched for exactly as written
 */
function escapeForSearch(text: string): string {
	const charactersWithMeaning = /[.*+?^${}()|[\]\\]/g
	return text.replace(charactersWithMeaning, '\\$&')
}
