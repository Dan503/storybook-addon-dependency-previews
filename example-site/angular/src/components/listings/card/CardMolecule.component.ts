import { Component, input } from '@angular/core';
import type { Meal } from 'example-site-shared/data';
import {
	getFullAddressViaColons,
	type ColonRouteTemplate,
	type HrefParams,
	type LinkAddressPropsViaColons,
} from 'example-site-shared/utils';
import type { AngularComponentProps } from 'storybook-addon-dependency-previews';
import { InternalLinkAtomDirective } from '../../01-atoms/InternalLinkAtom.directive';

@Component({
	selector: 'card-molecule',
	host: { '[class]': '["CardMolecule", "@container", "h-full", "grid", class()].join(" ")' },
	template: `
		<a
			[internalLink]="href()"
			[hrefParams]="hrefParams()"
			class="grid @max-sm:grid-rows-[auto_1fr] @min-sm:grid-cols-[200px_1fr] h-full @min-sm:gap-2 overflow-hidden rounded-2xl border bg-white transition-all hover:transform-[scale(1.02)] hover:bg-teal-200 hover:shadow-lg focus:bg-teal-200"
		>
			<img [src]="imgSrc()" alt="" class="aspect-video object-cover h-full" />
			<div class="w-full p-4">
				<h3 class="text-xl font-bold">{{ title() }}</h3>
				<p class="line-clamp-4">{{ description() }}</p>
			</div>
		</a>
	`,
	standalone: true,
	imports: [InternalLinkAtomDirective],
	styles: ``,
})
export class CardMoleculeComponent {
	class = input<string>('');
	title = input<string>('');
	imgSrc = input<string>('');
	description = input<string>('');
	// The site takes the shared routes in the colon spelling its own router already
	// writes, so a card's link and `app.routes.ts` say the same thing. The piece
	// that completes the route is filled in by `InternalLinkAtom` on the anchor.
	href = input.required<ColonRouteTemplate>();
	hrefParams = input<HrefParams>();
}

/**
 * What a card needs to draw itself.
 *
 * The address and its pieces come from the shared type rather than being read back
 * off the component's inputs, which keeps the pieces optional. Read off the inputs
 * they would come out as something every card has to spell out, even a card whose
 * address has no changing piece in it.
 */
export type PropsForCardMolecule = AngularComponentProps<
	CardMoleculeComponent,
	'class' | 'href' | 'hrefParams'
> &
	LinkAddressPropsViaColons;

/**
 * Where a meal's page lives, in this site's spelling.
 *
 * Named once because both builders below point at it, and the whole change exists
 * so that a route is written down in one place rather than restated wherever it is
 * needed. `satisfies` checks it is one of the shared routes without widening it —
 * `const` is what keeps it the exact template, so an annotation here would lose
 * the very narrowing the check is protecting.
 */
const mealRoute = '/meal/:mealId' satisfies ColonRouteTemplate;

/**
 * Builds the card for one meal.
 *
 * Both lists that show meals — the featured ones on the home page and the ones in
 * a category — draw the same card from the same fields, so they share this rather
 * than each writing it out.
 *
 * @param meal - the meal the card stands for
 */
export function getMealCard(meal: Meal): PropsForCardMolecule {
	return {
		title: meal.name,
		description: meal.area,
		imgSrc: meal.image,
		href: mealRoute,
		hrefParams: { mealId: meal.id },
	};
}

/**
 * Points the shared example cards at this site's spelling of the meal route.
 *
 * The example data writes its routes in the dollar spelling, which this site does
 * not use. Handing those cards over as they are would not fail: the colon filler
 * finds no `:name` to replace and returns the template untouched, so every card
 * would link to the same unfilled address. The stories that draw meal cards from
 * that data pass it through here first.
 *
 * @param cards - example cards whose route needs restating in this spelling
 */
export function getMealCardsForThisSite(
	cards: Array<Omit<PropsForCardMolecule, 'href'>>,
): Array<PropsForCardMolecule> {
	return cards.map((card) => ({ ...card, href: mealRoute }));
}

/**
 * The value that tells one card in a list apart from the others, for Angular's
 * `track`.
 *
 * The finished address. The cards in a list share one route and differ only in the
 * piece that completes it, so filling the route in is what separates them — and it
 * separates them by the piece the route actually names, rather than by whichever
 * piece happens to be present. That distinction is not idle: `hrefParams` can carry
 * both names, so picking the first one there would hand two cards the same value
 * whenever they shared a piece their own route does not use.
 *
 * A card on a route with nothing changing in it — `/` or `/contact` — comes back as
 * that route itself, so two of those in one list would share a value. No list the
 * site draws mixes them in, and the version before this one had the same gap.
 *
 * This is the same call the card's own link makes, on the same card, so it widens
 * nothing: what changes is when it happens, since the list is reconciled before the
 * cards exist and a bad card would fail the list rather than only itself.
 *
 * @param card - the card being drawn
 */
export function getCardTrackValue(card: PropsForCardMolecule): string {
	return getFullAddressViaColons(card);
}
