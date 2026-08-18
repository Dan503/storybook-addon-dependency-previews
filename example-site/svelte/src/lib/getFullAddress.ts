import { resolve } from '$app/paths';
import type { ResolvedPathname, RouteId, RouteParams } from '$app/types';

/**
 * Where a link points: one of this site's addresses, together with the pieces that complete it.
 *
 * Each address is tied to its own pieces, so `/meal/[mealId]` will not type-check without a
 * `mealId`, an address that takes nothing refuses pieces, and a piece under the wrong name is
 * refused too. That is the same checking `resolve` does at a call site that writes the address
 * out; this carries it through a component prop, which only learns its address when it is drawn.
 *
 * Built from the addresses SvelteKit generates for this site, so a route folder that gains or
 * renames a changing piece needs no edit here — the pairings follow it, and a call site still
 * passing the old one stops compiling.
 *
 * `/meal` is on the list as well, and is a folder with no page behind it — linking to it reaches a
 * "not found" page. Every other address is a real page.
 */
export type LinkAddress = {
	[Address in RouteId]: RouteParams<Address> extends Record<string, never>
		? { href: Address; hrefParams?: never }
		: { href: Address; hrefParams: RouteParams<Address> };
}[RouteId];

/**
 * The same, for a link whose address may be left off entirely.
 *
 * The last member is what allows that, and it is why pieces cannot arrive without an address:
 * leaving the address off means leaving the pieces off too.
 */
export type OptionalLinkAddress = LinkAddress | { href?: never; hrefParams?: never };

/** The pieces that complete an address, whichever address it is. */
export type HrefParams = NonNullable<LinkAddress['hrefParams']>;

/**
 * Fills an address's changing pieces in and hands back the address to link to.
 *
 * This exists for two reasons, and neither is checking the pairing. First, `resolve` insists on
 * knowing which address it is being handed so it can demand that address's own pieces, and a link
 * component only learns its address when it is drawn; destructuring the props loses the tie between
 * the two, so the call is made through a widened view. Second, `resolve` puts a piece into the
 * address exactly as it is given, so each one is escaped here. SvelteKit unescapes it again before
 * a page reads it back, so a page needs to do nothing itself.
 *
 * So these two arguments arrive untied, and calling this directly is unchecked:
 * `getFullAddress('/contact', { mealId: '1' })` compiles. What is checked is `LinkAddress`, where a
 * component's props are set — so the two listing components were checked before they reached here.
 *
 * For a link written straight into markup there is nothing to carry through a prop, so call
 * `resolve` and get the pairing checked: that is what the nav links and the site logo do.
 */
export function getFullAddress(href: RouteId, hrefParams?: HrefParams): ResolvedPathname {
	const escapedPieces = Object.entries(hrefParams ?? {}).map(([name, pieceValue]) => [
		name,
		encodeURIComponent(pieceValue)
	]);
	const resolveUntiedAddress = resolve as (
		href: RouteId,
		hrefParams: Record<string, string>
	) => ResolvedPathname;
	return resolveUntiedAddress(href, Object.fromEntries(escapedPieces));
}

/**
 * The same, for a link whose address may be left off — it hands back nothing when there is no
 * address, so the caller can draw plain content instead.
 */
export function getOptionalFullAddress(
	href?: RouteId,
	hrefParams?: HrefParams
): ResolvedPathname | undefined {
	if (!href) return undefined;
	return getFullAddress(href, hrefParams);
}
