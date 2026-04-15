import { Component, input } from '@angular/core';
import { CardMoleculeComponent, type PropsForCardMolecule } from './CardMolecule.component';

@Component({
	selector: 'card-listing-organism',
	host: { '[class]': '["@container", "grid", class()].join(" ")' },
	template: `
		<div class="CardListingOrganism grid gap-6" [attr.data-view]="view()">
			@for (card of cards(); track card.href) {
				<card-molecule
					[title]="card.title"
					[href]="card.href"
					[description]="card.description"
					[imgSrc]="card.imgSrc"
				/>
			}
		</div>
	`,
	styles: `
		.CardListingOrganism[data-view='grid'] {
			grid-template-columns: repeat(3, minmax(0, 1fr));

			@container (width < 800px) {
				grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
			}

			@container (width > 1400px) {
				grid-template-columns: repeat(6, minmax(0, 1fr));
			}
		}
	`,
	standalone: true,
	imports: [CardMoleculeComponent],
})
export class CardListingOrganismComponent {
	class = input<string>('');
	cards = input<Array<PropsForCardMolecule>>([]);
	view = input<'grid' | 'list'>('grid');
}
