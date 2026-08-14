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
			<!-- Tracked by position: an item's address is allowed to be missing, and
			its title may be too, so neither can be relied on to differ. -->
			@for (card of items(); track $index) {
				<li>
					<compact-listing-molecule
						[title]="card.title ?? ''"
						[description]="card.description ?? ''"
						[imageSrc]="card.imageSrc ?? ''"
						[href]="card.href"
						[hrefParams]="card.hrefParams"
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
