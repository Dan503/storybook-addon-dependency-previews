/**
 * Every route this site family has, as a template in one framework's spelling.
 *
 * A template is the pattern rather than a finished address: `/meal/$mealId` says
 * where meal pages live, and a filler turns one into `/meal/52772`. Templates
 * with nothing changing in them, like `/contact`, are already addresses.
 *
 * This is the one place the routes are written down. Everything else in this
 * file is derived from it: `RouteTemplateArray` reads back what this returns and
 * `RouteTemplate` is one member of that, so adding a route to the array below
 * adds it to every type and every site that reads them, with nothing else to
 * update. A site calls this when it needs the same routes in its own router or
 * route-file spelling, rather than writing them out a second time — though the
 * three spellings in use are already generated below, so most sites import one
 * of those instead.
 *
 * Two things about the shape are load-bearing rather than incidental:
 *
 * There is deliberately **no return type annotation**. The types are read off
 * this function, so annotating it would make the annotation the source of truth
 * instead of the array — and naming `RouteTemplate` here would be circular.
 *
 * Each changing piece goes through `routeParam` rather than being written into
 * the template directly, so that what runs and what the type says are built from
 * the same parts and cannot drift.
 *
 * @param marks - what this spelling puts either side of a changing piece
 */
export function generateRouteTemplates<
	Before extends string,
	After extends string,
>({ before, after }: RouteMarks<Before, After>) {
	return [
		`/`,
		`/categories`,
		`/categories/${routeParam(before, 'category', after)}`,
		`/meal/${routeParam(before, 'mealId', after)}`,
		`/contact`,
	]
}

/**
 * One route the example sites link to, as a template.
 *
 * One member of the list `generateRouteTemplates` returns, which is where the
 * routes themselves are written down. Solid and Vue are the sites that import
 * this. React and Svelte sit on the same routes but each reads them from the
 * list its own router generates, so neither needs anything from here. Angular is
 * still being moved onto them, so for now a few of its pages are at routes that
 * are not in this list.
 *
 * A site that uses this list has its routes added here by hand, and how much
 * that buys depends on how much of the site goes through it. Solid puts every
 * internal link through the list, so a link to a route the list does not have is
 * refused; Vue only puts its card links through it, and its navigation links are
 * still free text. Either way a page nobody links to still slips by. Angular
 * will want the same care once it moves onto the list. React and Svelte read
 * their own generated lists, so their pages are not this list's concern.
 *
 * Each template is spelled out in full rather than written as a fixed start plus
 * free text, because one that is only partly written out is never offered as an
 * autocomplete option.
 *
 * Every framework marks a changing piece its own way, so the marks that sit
 * either side of one are given as arguments and the same five templates can be
 * had in any of those spellings. There is no default: a site says which spelling
 * it means.
 *
 * Prefer asking for a spelling by its name below to writing the marks out where
 * they are used. Either works, and both autocomplete — a name just reads better
 * at the point of use than a pair of marks does.
 */
export type RouteTemplate<
	Before extends string,
	After extends string,
> = RouteTemplateArray<Before, After>[number]

/**
 * All the templates at once, in one spelling, as `generateRouteTemplates`
 * returns them.
 *
 * Read off that function rather than written out, so the two cannot disagree —
 * which is the whole reason the routes live in a function at all. Useful for
 * typing a list a site hands to its router; `RouteTemplate` is the type of a
 * single one.
 */
export type RouteTemplateArray<
	Before extends string,
	After extends string,
> = ReturnType<typeof generateRouteTemplates<Before, After>>

/** A changing piece as one framework writes it: `$mealId`, `:mealId`, `[mealId]`. */
type RouteParam<
	Before extends string,
	Name extends string,
	After extends string,
> = `${Before}${Name}${After}`

/**
 * Writes one changing piece the way a framework marks it.
 *
 * The runtime twin of `RouteParam`, and annotated with it so the two are the
 * same shape by construction. That annotation is what lets
 * `generateRouteTemplates` be read as a source of literal templates: without it
 * this returns a plain string, every template built from it widens to `string`,
 * and the types derived from them stop naming anything.
 *
 * @param before - what this spelling puts in front of the name
 * @param name - the piece's name, like `mealId`
 * @param after - what this spelling puts after the name, often nothing
 */
function routeParam<
	Before extends string,
	Name extends string,
	After extends string,
>(before: Before, name: Name, after: After): RouteParam<Before, Name, After> {
	return `${before}${name}${after}`
}

/** A template with a `:` before each changing piece, as a router matches them. */
export type ColonRouteTemplate = RouteTemplate<':', ''>

/** A template with a `$` before each changing piece. */
export type DollarRouteTemplate = RouteTemplate<'$', ''>

/** A template with each changing piece in brackets, as file-based routing names them. */
export type BracketRouteTemplate = RouteTemplate<'[', ']'>

/*
 * The three spellings, generated once here so a site imports the set it needs
 * instead of keeping a file of its own to call the generator from. Each is
 * annotated with its own type: without that the list widens to plain strings and
 * stops refusing the other spellings, the same way the fillers below do.
 */

/** Every template with a `$` before each changing piece. */
export const dollarRouteTemplates: RouteTemplateArray<'$', ''> =
	generateRouteTemplates({ before: '$', after: '' })

/** Every template with a `:` before each changing piece, ready for a router. */
export const colonRouteTemplates: RouteTemplateArray<':', ''> =
	generateRouteTemplates({ before: ':', after: '' })

/** Every template with each changing piece in brackets, as page files name them. */
export const bracketRouteTemplates: RouteTemplateArray<'[', ']'> =
	generateRouteTemplates({ before: '[', after: ']' })

/**
 * Any of the spellings a site may pick.
 *
 * Private: it is only the bound on `LinkAddressProps` and the fillers, and a
 * site names the one spelling it uses rather than this. Declaration output keeps
 * it without needing it exported.
 */
type AnyRouteTemplateStyle = RouteTemplate<string, string>

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

/** The name of each changing piece a template can have. */
export type HrefParamName = 'category' | 'mealId'

/**
 * The pieces that complete a template, looked up by name.
 *
 * Every entry is optional because a template needs only its own piece — there is
 * no template that takes both.
 */
export type HrefParams = Partial<Record<HrefParamName, string>>

/**
 * Where a link points: a route template, plus the pieces that complete it. A
 * filler turns the two into the address the link finally carries.
 *
 * They are separate props so that the sites' link components stay a plain set of
 * props rather than a set of alternatives, which is what Storybook needs to work
 * out a story's arguments. So the type checks the piece *names* but not the
 * pairing: it cannot say that `/meal/$mealId` in particular must be given a
 * `mealId`. The filler checks that when it builds the address.
 *
 * The spelling is named rather than assumed, so a site passes the one it writes
 * its templates in — `LinkAddressProps<BracketRouteTemplate>` for a site whose
 * pages are files named `[mealId]`.
 */
export interface LinkAddressProps<RouteStyle extends AnyRouteTemplateStyle> {
	/**
	 * The page to link to, written in this site's spelling. The marked-out name
	 * in it stands for a piece that changes and has to be supplied in
	 * `hrefParams`.
	 */
	href: RouteStyle
	/**
	 * The pieces that complete the template, looked up by the name inside the
	 * marks. A template with no changing piece needs none of these. Leaving out a
	 * piece a template does need throws when the link is drawn — the type cannot
	 * catch it, because it does not tie the two together.
	 */
	hrefParams?: HrefParams
}

/** Turns a template into the address a link carries, for one spelling of them. */
type FillAddress<RouteStyle extends AnyRouteTemplateStyle> = (
	linkAddress: LinkAddressProps<RouteStyle>,
) => string

/**
 * Builds a filler for templates written in one framework's spelling.
 *
 * The marks are fixed when a filler is built rather than passed to each call. An
 * optional pair the caller could leave off would let the compiler read the
 * spelling off whichever template it was handed and accept it, and the filler
 * would then look for pieces marked a way that template does not use — finding
 * none, changing nothing, and handing back the template with its marks still in
 * it.
 *
 * Keep the `FillAddress` annotation on each of the three fillers below. They
 * look like they merely restate what this function already works out from the
 * marks it is handed, and they do not: taking the annotation off one of them and
 * rebuilding lets that filler accept a template in any spelling, checked by
 * doing it. So the refusal comes from the annotations, not from here.
 *
 * @param marks - what this spelling puts either side of a changing piece
 */
function createAddressFiller<Before extends string, After extends string>(
	marks: RouteMarks<Before, After>,
) {
	const { before, after } = marks
	// Built once for the filler rather than per call. The marks are data now, and
	// some of them mean something in a search, so each is escaped first — left
	// raw, `$` matches the end of the template and `[` starts a set of characters.
	// A `:` needs no escaping, but the marks are not this function's to know.
	const changingPiece = new RegExp(
		`${escapeForSearch(before)}(\\w+)${escapeForSearch(after)}`,
		'g',
	)

	/**
	 * Fills a template's changing pieces in and hands back the address to link to.
	 *
	 * Each piece is escaped on the way in. Whether a page has to unescape it on
	 * the way out is its framework's business: vue-router and SvelteKit hand a
	 * page the original text already, so the Vue category page reads its piece
	 * straight, while a framework that passes the address through untouched needs
	 * the page to unescape it. Escaping leaves digits alone either way, which is
	 * why a piece that is always a number reads back the same everywhere.
	 *
	 * A template with a changing piece that was given no matching value throws,
	 * and so does one given an empty value, since both build a link that quietly
	 * points at the wrong page.
	 */
	return ({
		href,
		hrefParams,
	}: LinkAddressProps<RouteTemplate<Before, After>>): string => {
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

/** Fills in a template written with a `$` before each changing piece. */
export const getFullAddressViaDollars: FillAddress<DollarRouteTemplate> =
	createAddressFiller({ before: '$', after: '' })

/** Fills in a template written with a `:` before each changing piece. */
export const getFullAddressViaColons: FillAddress<ColonRouteTemplate> =
	createAddressFiller({ before: ':', after: '' })

/** Fills in a template written with each changing piece in brackets. */
export const getFullAddressViaBrackets: FillAddress<BracketRouteTemplate> =
	createAddressFiller({ before: '[', after: ']' })

/** What `getUnusablePieceMessage` needs to say which piece went wrong, and how. */
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
 * all, so a template comes back with its marks still in it and the link quietly
 * points at the wrong page, while an unescaped `[` becomes a set of characters
 * that matches almost anything, so it throws on every template carrying a letter
 * — every one of them except `/`. A `:` happens to be safe already; passing
 * every mark through here means no caller has to know which are which.
 *
 * @param text - the text to be searched for exactly as written
 */
function escapeForSearch(text: string): string {
	const charactersWithMeaning = /[.*+?^${}()|[\]\\]/g
	return text.replace(charactersWithMeaning, '\\$&')
}
