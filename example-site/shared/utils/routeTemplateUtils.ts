/**
 * Every route the example sites share, as a template in one framework's
 * spelling. A site can still have routes of its own that are not here — some of
 * the sites carry routes that serve data or catch a bad address rather than
 * answering one of these.
 *
 * A template is the pattern rather than a finished address: `/meal/$mealId` says
 * where meal pages live, and a filler turns one into `/meal/52772`. Templates
 * with nothing changing in them, like `/contact`, are already addresses.
 *
 * The templates are read back off the array below: `RouteTemplateArray` reads
 * what this returns and `RouteTemplate` is one member of that, so adding a route
 * there adds it to every spelling and to every site checked against them.
 *
 * Two things it does not reach, both worth knowing before adding a route.
 *
 * A changing piece's *name* is written by hand, in `HrefParamName` below. A
 * route whose piece is named something no other route uses needs adding there as
 * well, or the value meant to complete it is refused — and nothing about the
 * array prompts you to make that second edit.
 *
 * The shared example data in `../data/example-meal-data.ts` writes two of the
 * routes out by hand for the stories to draw from, in object literals nothing
 * checks, so dropping a route from the array leaves those still compiling and
 * still pointing at a page that has gone. Typing that file is a change of its
 * own.
 *
 * A site calls this when it needs the same routes in its own router or
 * route-file spelling, rather than writing them out a second time — though the
 * three spellings in use are already generated below, and every site reading the
 * routes today imports one of those instead.
 *
 * Three things about the shape are load-bearing rather than incidental:
 *
 * The array ends in **`as const`**. Without it a template built from the marks
 * is just a string as far as the compiler is concerned, so every type below says
 * `string`, no route is ever offered as a completion, and a template in the
 * wrong spelling — or one that is not a route at all — is accepted everywhere.
 * Nothing fails when it is missing, which is what makes it worth saying: the
 * check simply stops finding anything.
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
	] as const
}

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

/**
 * One route the example sites link to, as a template.
 *
 * One member of the list `generateRouteTemplates` returns, which is where the
 * routes themselves are written down. Solid, Vue and Angular are the sites that
 * read these, though none names this type: each takes one of the named spellings
 * below, or the link props built from it. React and Svelte sit on the same
 * routes but each reads them from the list its own router generates, so neither
 * needs anything from here.
 *
 * A site that uses this list has its routes added here by hand, and how much
 * that buys depends on how much of the site goes through it. Solid and Vue both
 * put every internal link through the list, so a link to a route the list does
 * not have is refused. A page nobody links to still slips by. Angular puts every
 * internal link through the list as well, its nav included — a `routerLink`
 * written as a binding rather than as plain text is checked like anything else.
 * React and Svelte read their own generated lists, so their pages are not this
 * list's concern.
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
 * same shape by construction. That annotation is load-bearing, checked by taking
 * it off: this then hands back a plain string, and every template built from it
 * says only how it starts — `/meal/${string}` rather than `/meal/$mealId` — so
 * anything at all after `/meal/` is accepted and nothing is offered to complete
 * it.
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
 * instead of keeping a file of its own to call the generator from.
 *
 * Each is annotated with its own type, which is what ties the name to the marks:
 * the marks are handed over as plain values, so nothing else would notice a list
 * called `dollarRouteTemplates` being generated with `:` marks. Checked by doing
 * it — the annotation reports the mismatch template by template. It is not what
 * keeps the templates from widening to plain strings; the `as const` on the
 * generated array does that.
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

/**
 * The name of each changing piece a template can have.
 *
 * Written out rather than read back off `generateRouteTemplates`, so adding a
 * route there does not update it. A route with a piece named something no other
 * route uses has to be added here in the same breath, or the value meant to
 * complete it is refused as a name this does not have.
 */
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
 * its templates in. Prefer one of the three named below to writing that out:
 * `LinkAddressPropsViaBrackets` says the same as
 * `LinkAddressProps<BracketRouteTemplate>` and reads better where a component
 * states its props.
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

/*
 * The three spellings again, this time as a link's props. Named for the same
 * reason the fillers are: a site states one of these instead of writing the
 * spelling out at each component that takes a link.
 */

/** Where a link points, written with a `$` before each changing piece. */
export type LinkAddressPropsViaDollars = LinkAddressProps<DollarRouteTemplate>

/** Where a link points, written with a `:` before each changing piece. */
export type LinkAddressPropsViaColons = LinkAddressProps<ColonRouteTemplate>

/** Where a link points, written with each changing piece in brackets. */
export type LinkAddressPropsViaBrackets = LinkAddressProps<BracketRouteTemplate>

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
 * The refusal itself comes from here: the returned function takes templates in
 * this filler's own spelling, so one written another way is turned away and the
 * right spelling named. The `FillAddress` annotation on each of the three
 * fillers below does the same job as the annotations on the three lists — it
 * ties the filler's name to the marks it was built with, since nothing else
 * would notice `getFullAddressViaDollars` being built with `:` marks.
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
	/** the template being filled in, quoted back in the message */
	href: string
	/** the piece as it appears in the template, like `$mealId` or `[mealId]` */
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
		return `The link "${href}" was given an empty ${marker}, which would point at the wrong page.`
	}
	// A name carrying no value does not count as given. Listing it would point
	// the reader at a name that is already there, rather than at the value.
	const namesGiven = [...pieceValues]
		.filter(([, pieceValue]) => pieceValue)
		.map(([name]) => name)
	const whatWasGiven = namesGiven.length
		? `only these were given: ${namesGiven.join(', ')}`
		: 'none were given'
	return `The link "${href}" needs a value for ${marker} in hrefParams, but ${whatWasGiven}.`
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
