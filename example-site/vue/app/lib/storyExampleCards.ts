/*
 * The shared example cards, with their addresses put into this site's spelling,
 * for the stories to draw from.
 *
 * The example sites share one set of example cards, and those cards write an
 * address the way the React site's router does — `/meal/$mealId`. This site
 * names its pages `[mealId]`, so a shared card handed straight to a listing here
 * carries an address the site does not have. Swapping the address is all that is
 * needed: the pieces that complete it already travel alongside under the same
 * names.
 *
 * Only the stories use these — the site's own pages build their cards from live
 * data. That matters, because story files sit outside what `pnpm typecheck`
 * reaches, so a card left unswapped would show up as a link pointing at a
 * literal `/meal/$mealId` rather than as an error. Each list below is checked
 * against the card's own props for that reason: this file is read by the type
 * check even though the stories drawing from it are not.
 */

import {
	categoryCardList,
	mealCardList,
	mealCards,
} from 'example-site-shared/data'
import type { RouteFileName } from 'example-site-shared/utils'
import type { PropsForCardMolecule } from '../../components/listings/card/CardMolecule.vue'

/**
 * Puts one address on every card in a list, leaving the rest of each card alone.
 *
 * @param cards - the shared cards to re-address
 * @param href - the address they should carry, in this site's spelling
 */
function withSiteAddress<TCard>(cards: Array<TCard>, href: RouteFileName) {
	return cards.map((card) => ({ ...card, href }))
}

/** Meal cards for the card listing organism's story. */
export const mealCardsForSite = withSiteAddress(
	mealCards,
	'/meal/[mealId]',
) satisfies Array<PropsForCardMolecule>

/** Category cards for the card list template's story. */
export const categoryCardListForSite = withSiteAddress(
	categoryCardList,
	'/categories/[category]',
) satisfies Array<PropsForCardMolecule>

/** Meal cards for the card list template's story — a different shape again. */
export const mealCardListForSite = withSiteAddress(
	mealCardList,
	'/meal/[mealId]',
) satisfies Array<PropsForCardMolecule>
