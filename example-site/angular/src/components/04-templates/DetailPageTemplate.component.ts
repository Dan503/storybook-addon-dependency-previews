import { Component, input } from '@angular/core'
import { CommonModule } from '@angular/common'
import type { Meal } from 'example-site-shared/utils'
import { SiteFrameOrganismComponent } from '../03-organisms/SiteFrameOrganism.component'
import { ScreenPaddingAtomComponent } from '../01-atoms/ScreenPaddingAtom.component'
import { CompactListingOrganismComponent } from '../listings/compact/CompactListingOrganism.component'

@Component({
	selector: 'app-detail-page-template',
	standalone: true,
	imports: [
		CommonModule,
		SiteFrameOrganismComponent,
		ScreenPaddingAtomComponent,
		CompactListingOrganismComponent,
	],
	templateUrl: './DetailPageTemplate.component.html',
})
export class DetailPageTemplateComponent {
	meal = input<Meal | null | undefined>()
	isLoading = input(false)

	get ingredientItems() {
		return (
			this.meal()?.ingredients.map((x) => ({
				title: x.ingredient,
				description: x.amount,
				imageSrc: x.imageUrl.small,
			})) ?? []
		)
	}
}
