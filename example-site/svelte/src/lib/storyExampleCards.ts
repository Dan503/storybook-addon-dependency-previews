import { categoryCardList, mealCardList, mealCards } from 'example-site-shared/data';
import type { RouteId } from '$app/types';
import type { LinkAddress } from '$lib/getFullAddress';

/**
 * The shared example cards, with their addresses put in Svelte's marking, for the stories to
 * draw from.
 *
 * The five example sites share one set of example cards, and those cards write an address the way
 * the React site's router does — `/meal/$mealId`. That is not an address this site has, so a card
 * handed straight to a listing here is refused. Swapping the address is all that is needed: the
 * pieces that complete it already travel alongside under the same name.
 *
 * Only the stories use these. The site's own pages build their cards from live data.
 *
 * The address is taken as its own type parameter rather than plain `RouteId` so that each call
 * keeps the literal it passed. Widening it to `RouteId` would throw that away, and `LinkAddress`
 * can only tie an address to its pieces while it still knows which address it is — which is what
 * the `satisfies` on each export below checks.
 */
function withSvelteAddress<TCard, TAddress extends RouteId>(cards: Array<TCard>, href: TAddress) {
	return cards.map((card) => ({ ...card, href }));
}

/** Meal cards for the card listing organism's story. */
export const mealCardsForSvelte = withSvelteAddress(
	mealCards,
	'/meal/[mealId]'
) satisfies Array<LinkAddress>;

/** Category cards for the card list template's story. */
export const categoryCardListForSvelte = withSvelteAddress(
	categoryCardList,
	'/categories/[category]'
) satisfies Array<LinkAddress>;

/** Meal cards for the card list template's story — a different shape from `mealCardsForSvelte`. */
export const mealCardListForSvelte = withSvelteAddress(
	mealCardList,
	'/meal/[mealId]'
) satisfies Array<LinkAddress>;
