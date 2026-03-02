import { Component, input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CompactListingMoleculeComponent } from './CompactListingMolecule.component'

export interface CompactItem {
	title: string
	description?: string
	imageSrc?: string
	href?: string
}

@Component({
	selector: 'app-compact-listing-organism',
	standalone: true,
	imports: [CommonModule, CompactListingMoleculeComponent],
	templateUrl: './CompactListingOrganism.component.html',
})
export class CompactListingOrganismComponent {
	items = input<Array<CompactItem>>([])
}
