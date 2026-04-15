import { Component, input } from '@angular/core';
import { SiteFrameOrganismComponent } from '../03-organisms/SiteFrameOrganism.component';
import { ScreenPaddingAtomComponent } from '../01-atoms/ScreenPaddingAtom.component';
import { CardListingOrganismComponent } from '../listings/card/CardListingOrganism.component';
import type { PropsForCardMolecule } from '../listings/card/CardMolecule.component';

@Component({
	selector: 'card-list-template',
	host: { '[class]': '["MealListTemplate", class()].join(" ")' },
	template: `
		<site-frame-organism>
			<screen-padding-atom class="py-8">
				<div class="grid gap-4">
					<h1 class="text-4xl font-bold">{{ title() }}</h1>
					<p class="mb-2">{{ introText() }}</p>
					<card-listing-organism [cards]="cardList()" [view]="view()" />
				</div>
			</screen-padding-atom>
		</site-frame-organism>
	`,
	standalone: true,
	imports: [SiteFrameOrganismComponent, ScreenPaddingAtomComponent, CardListingOrganismComponent],
})
export class CardListTemplateComponent {
	class = input<string>('');
	title = input<string>('');
	introText = input<string>('');
	cardList = input<Array<PropsForCardMolecule>>([]);
	view = input<'grid' | 'list'>('grid');
}
