import { Component, input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CardMoleculeComponent, type CardItem } from './CardMolecule.component'

export type { CardItem }

@Component({
	selector: 'app-card-listing-organism',
	standalone: true,
	imports: [CommonModule, CardMoleculeComponent],
	templateUrl: './CardListingOrganism.component.html',
})
export class CardListingOrganismComponent {
	cards = input<Array<CardItem>>([])
}
