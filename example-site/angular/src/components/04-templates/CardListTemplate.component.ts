import { Component, input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SiteFrameOrganismComponent } from '../03-organisms/SiteFrameOrganism.component'
import { ScreenPaddingAtomComponent } from '../01-atoms/ScreenPaddingAtom.component'
import { CardListingOrganismComponent } from '../listings/card/CardListingOrganism.component'
import type { CardItem } from '../listings/card/CardListingOrganism.component'

@Component({
	selector: 'app-card-list-template',
	standalone: true,
	imports: [
		CommonModule,
		SiteFrameOrganismComponent,
		ScreenPaddingAtomComponent,
		CardListingOrganismComponent,
	],
	templateUrl: './CardListTemplate.component.html',
})
export class CardListTemplateComponent {
	title = input.required<string>()
	introText = input<string>()
	cardList = input<Array<CardItem>>([])
}
