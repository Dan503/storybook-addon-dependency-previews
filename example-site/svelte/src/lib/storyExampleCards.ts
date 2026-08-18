import { categoryCardList, mealCardList, mealCards } from 'example-site-shared/data';
import type { RouteId } from '$app/types';

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
 */
function withSvelteAddress<TCard>(cards: Array<TCard>, href: RouteId) {
	return cards.map((card) => ({ ...card, href }));
}

/** Meal cards for the card listing organism's story. */
export const mealCardsForSvelte = withSvelteAddress(mealCards, '/meal/[mealId]');

/** Category cards for the card list template's story. */
export const categoryCardListForSvelte = withSvelteAddress(
	categoryCardList,
	'/categories/[category]'
);

/** Meal cards for the card list template's story — a different shape from `mealCardsForSvelte`. */
export const mealCardListForSvelte = withSvelteAddress(mealCardList, '/meal/[mealId]');
