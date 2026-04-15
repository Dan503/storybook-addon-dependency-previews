import { Component, input } from '@angular/core';
import {
	PropsForCompactListingMolecule,
	CompactListingMoleculeComponent,
} from './CompactListingMolecule.component';

@Component({
	selector: 'compact-listing-organism',
	host: { '[class]': '["CompactListingOrganism", class()].join(" ")' },
	template: `
		<ul class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
			@for (card of items(); track card.href) {
				<li>
					<compact-listing-molecule
						[title]="card.title ?? ''"
						[description]="card.description ?? ''"
						[imageSrc]="card.imageSrc ?? ''"
						[href]="card.href ?? ''"
					/>
				</li>
			}
		</ul>
	`,
	standalone: true,
	imports: [CompactListingMoleculeComponent],
})
export class CompactListingOrganismComponent {
	class = input<string>('');
	items = input<Array<Partial<PropsForCompactListingMolecule>>>([]);
}
