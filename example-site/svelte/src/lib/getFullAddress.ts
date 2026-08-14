import { resolve } from '$app/paths';
import type { ResolvedPathname, RouteId, RouteParams } from '$app/types';

/**
 * The pieces that complete an address, looked up by name.
 *
 * The names come from the addresses SvelteKit generates rather than being written out here, so
 * renaming a piece in a route folder fails the type check on this line instead of drifting quietly.
 *
 * Every entry is optional because an address needs only its own piece — no address on this site
 * takes both.
 */
export type HrefParams = Partial<
	RouteParams<'/categories/[category]'> & RouteParams<'/meal/[mealId]'>
>;

/** A `[name]` in an address, standing for a piece that changes. */
const changingPiece = /\[(\w+)\]/g;

/**
 * Fills an address's changing pieces in and hands back the address to link to.
 *
 * The address and its pieces reach a link component as two separate props, because tying them
 * together would make the props a set of alternatives, which is what stops Storybook working out a
 * story's arguments. So the type cannot say that `/meal/[mealId]` in particular must be given a
 * `mealId`, and that is checked here instead, when the link is drawn: an address is refused if it
 * was left without a piece it needs, or handed one it has no place to put, since both build a link
 * that quietly points at the wrong page.
 *
 * Each piece is escaped, because `resolve` puts a piece into the address exactly as it is given.
 * SvelteKit unescapes it again before a page reads it back, so a page needs to do nothing itself.
 *
 * Every address on this site marks a changing piece as `[name]`. SvelteKit can also write a piece
 * that may be left out, or one that swallows the rest of the address; this would need teaching
 * about those before either could be used.
 *
 * This does much the same work as the `getFullAddress` in `example-site-shared`, which the sites
 * whose framework writes no list of its own share. It is kept separate so that this site's
 * addresses stay the ones SvelteKit generates from its own route folders — the shared list is
 * written by hand, and marks a changing piece as `$name` rather than `[name]`.
 */
export function getFullAddress(href: RouteId, hrefParams?: HrefParams): ResolvedPathname {
	const namesNeeded = [...href.matchAll(changingPiece)].map(([, name]) => name);
	// A Map rather than the object itself, so a piece named after something every object inherits
	// (`constructor`, `toString`) reads as absent rather than picking up the inherited value.
	const piecesGiven = new Map(Object.entries(hrefParams ?? {}));
	assertNeededPiecesAreGiven(href, namesNeeded, piecesGiven);
	assertNoSparePiecesAreGiven(href, namesNeeded, piecesGiven);

	const escapedPieces = [...piecesGiven].map(([name, pieceValue]) => [
		name,
		encodeURIComponent(pieceValue)
	]);
	// `resolve` normally wants to know which address it is being handed, so it can insist on that
	// address's own pieces. A link component only learns its address when it is drawn, so it is
	// handed over through this widened view instead, and the two checks above stand in for what
	// `resolve` would have done had it known.
	const resolveUntiedAddress = resolve as (
		href: RouteId,
		hrefParams: Record<string, string>
	) => ResolvedPathname;
	return resolveUntiedAddress(href, Object.fromEntries(escapedPieces));
}

/**
 * Refuses an address left without a piece it needs, or given an empty one.
 *
 * @param href - the address being built, quoted back in the message
 * @param namesNeeded - the names in brackets read out of that address
 * @param piecesGiven - the pieces the caller passed, by name
 */
function assertNeededPiecesAreGiven(
	href: RouteId,
	namesNeeded: Array<string>,
	piecesGiven: Map<string, string>
): void {
	namesNeeded.forEach((name) => {
		const pieceValue = piecesGiven.get(name);
		if (pieceValue) return;
		const isPieceBlank = pieceValue === '';
		if (isPieceBlank) {
			throw new Error(
				`The address "${href}" was given an empty [${name}], which would link to the wrong page.`
			);
		}
		// A name carrying no value does not count as given. Listing it would point the reader at a
		// name that is already there, rather than at the value.
		const namesGiven = [...piecesGiven]
			.filter(([, givenValue]) => givenValue)
			.map(([givenName]) => givenName);
		const whatWasGiven = namesGiven.length
			? `only these were given: ${namesGiven.join(', ')}`
			: 'none were given';
		throw new Error(
			`The address "${href}" needs a value for [${name}] in hrefParams, but ${whatWasGiven}.`
		);
	});
}

/**
 * Refuses a piece the address has no place to put.
 *
 * @param href - the address being built, quoted back in the message
 * @param namesNeeded - the names in brackets read out of that address
 * @param piecesGiven - the pieces the caller passed, by name
 */
function assertNoSparePiecesAreGiven(
	href: RouteId,
	namesNeeded: Array<string>,
	piecesGiven: Map<string, string>
): void {
	const namesSpare = [...piecesGiven.keys()].filter((name) => !namesNeeded.includes(name));
	if (!namesSpare.length) return;
	const whatItTakes = namesNeeded.length
		? `it only takes ${namesNeeded.join(', ')}`
		: 'it takes none at all';
	throw new Error(
		`The address "${href}" was given ${namesSpare.join(', ')} in hrefParams, but ${whatItTakes}.`
	);
}
