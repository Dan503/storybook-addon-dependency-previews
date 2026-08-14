import { Component, computed, input } from '@angular/core';
import type { Meal } from 'example-site-shared/data';
import {
	getFullAddress,
	type HrefParams,
	type LinkAddress,
	type RouteAddress,
} from 'example-site-shared/utils';
import type { AngularComponentProps } from 'storybook-addon-dependency-previews';

@Component({
	selector: 'card-molecule',
	host: { '[class]': '["CardMolecule", "@container", "h-full", "grid", class()].join(" ")' },
	template: `
		<a
			[href]="fullAddress()"
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
	imports: [],
	styles: ``,
})
export class CardMoleculeComponent {
	class = input<string>('');
	title = input<string>('');
	imgSrc = input<string>('');
	description = input<string>('');
	href = input.required<RouteAddress>();
	hrefParams = input<HrefParams>();
	// A `$name` inside the address stands for a piece that changes; this fills it
	// in from `hrefParams`.
	protected fullAddress = computed(() =>
		getFullAddress({ href: this.href(), hrefParams: this.hrefParams() }),
	);
}

// The address and its pieces come from the shared type rather than being read back
// off the inputs above, which keeps the pieces optional. Read off the inputs they
// would come out as something every card has to spell out, even a card whose
// address has no changing piece in it.
export type PropsForCardMolecule = AngularComponentProps<
	CardMoleculeComponent,
	'class' | 'href' | 'hrefParams'
> &
	LinkAddress;

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
		href: '/meal/$mealId',
		hrefParams: { mealId: meal.id },
	};
}
