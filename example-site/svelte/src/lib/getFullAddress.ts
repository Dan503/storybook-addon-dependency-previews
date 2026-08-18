import { resolve } from '$app/paths';
import type { ResolvedPathname, RouteId, RouteParams } from '$app/types';

/** Every name across a set of alternatives — `keyof` on its own gives only the ones they share. */
type AnyKeyOf<T> = T extends unknown ? keyof T : never;

/**
 * The addresses that take a changing piece.
 *
 * `Exclude` drops the empty set every fixed address contributes, and it is doing real work rather
 * than tidying: that set's keys are `string`, which swallows the real names, and a piece named
 * anything at all would then be accepted.
 */
type AddressWithPieces = Exclude<RouteParams<RouteId>, Record<string, never>>;

/**
 * The pieces that complete an address, looked up by name.
 *
 * Worked out from the addresses SvelteKit generates for this site rather than listed here, so a
 * route folder that gains a changing piece, or renames one, needs no edit to this file — the names
 * follow it, and any call site still passing the old one stops compiling.
 *
 * Every entry is optional because an address needs only its own piece.
 */
export type HrefParams = Partial<Record<AnyKeyOf<AddressWithPieces>, string>>;

/**
 * A `[name]` in an address, standing for a piece that changes.
 *
 * Safe to share between calls despite the `g` flag: `matchAll` reads from its own copy and leaves
 * this one's position at the start, which a bare `exec` loop would not.
 */
const changingPiece = /\[(\w+)\]/g;

/**
 * The pieces that carry a value, as name-and-value pairs.
 *
 * A name written out as `undefined` is dropped, so it reads the same as one never written at all.
 * Without this, writing `{ category: undefined }` would count as having supplied a category.
 */
function getPiecesWithValues(hrefParams?: HrefParams): Array<[string, string]> {
	const everyPiece = Object.entries(hrefParams ?? {});
	return everyPiece.filter((piece): piece is [string, string] => piece[1] !== undefined);
}

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
 * Every address on this site marks a changing piece as `[name]`, which is the only form this reads.
 * None of the other forms SvelteKit can write would work here, and the worst of them says nothing.
 * An encoded character (`[x+2b]`, meaning a literal `+`) takes no piece, so neither check has
 * anything to refuse, and the brackets are left sitting in the address — while SvelteKit serves
 * that page at the decoded character instead. The link then points at a path the site never serves,
 * quietly, which is what this helper exists to prevent. The rest are noisy by comparison: a piece
 * that may be left out (`[[name]]`) is read as one that is required, so leaving it out is refused
 * even though the address allows it, and one that swallows the rest (`[...name]`) or carries a test
 * to pass (`[name=test]`) has its piece refused as one the address has no place for. Teaching this
 * about a form is what has to happen before that form can be used on this site.
 *
 * `example-site-shared` exports a `getFullAddress` of its own, deliberately sharing the name so the
 * sites read alike — nothing imports both, so there is no ambiguity at a call site. That one serves
 * the sites whose framework generates no address list, from a list written out by hand which marks
 * a changing piece as `$name`. This site keeps its own so its addresses stay the generated ones,
 * which is what makes a renamed route folder fail the type check rather than drift.
 */
export function getFullAddress(href: RouteId, hrefParams?: HrefParams): ResolvedPathname {
	const namesNeeded = [...href.matchAll(changingPiece)].map(([, name]) => name);
	// A Map rather than the object itself, so a piece named after something every object inherits
	// (`constructor`, `toString`) reads as absent rather than picking up the inherited value.
	const piecesGiven = new Map(getPiecesWithValues(hrefParams));
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
 * The same, for a link whose address may be left off entirely — it hands back nothing when there is
 * no address, so the caller can draw plain content instead.
 *
 * Pieces without an address are refused rather than ignored. Dropping them quietly is the same
 * silent-wrong-link shape the checks above exist to catch: it means the caller meant to link
 * somewhere and got plain content with no complaint.
 */
export function getOptionalFullAddress(
	href?: RouteId,
	hrefParams?: HrefParams
): ResolvedPathname | undefined {
	if (href) return getFullAddress(href, hrefParams);
	const namesGiven = getPiecesWithValues(hrefParams).map(([name]) => name);
	if (namesGiven.length) {
		throw new Error(
			`hrefParams was given ${namesGiven.join(', ')} with no href to put them in, so this would have drawn as plain content rather than a link.`
		);
	}
	return undefined;
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
		// Every name still here was written by the caller, so all of them are listed — including one
		// left empty, since the name is what the caller typed and is what they will go looking for.
		const namesGiven = [...piecesGiven.keys()];
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
