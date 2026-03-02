import { Component, input } from '@angular/core'
import type { Meal } from 'example-site-shared/utils'
import { SiteFrameOrganismComponent } from '../03-organisms/SiteFrameOrganism.component'
import { HeroBlockOrganismComponent } from '../03-organisms/HeroBlockOrganism.component'
import { ScreenPaddingAtomComponent } from '../01-atoms/ScreenPaddingAtom.component'
import { ExternalLinkAtomComponent } from '../01-atoms/ExternalLinkAtom.component'
import { CardListingOrganismComponent } from '../listings/card/CardListingOrganism.component'

@Component({
	selector: 'app-home-template',
	standalone: true,
	imports: [
		SiteFrameOrganismComponent,
		HeroBlockOrganismComponent,
		ScreenPaddingAtomComponent,
		ExternalLinkAtomComponent,
		CardListingOrganismComponent,
	],
	templateUrl: './HomeTemplate.component.html',
})
export class HomeTemplateComponent {
	featuredMeals = input.required<Array<Meal>>()

	get featureMeal() {
		return this.featuredMeals()[0]
	}

	get otherMeals() {
		return this.featuredMeals().slice(1)
	}

	get otherMealCards() {
		return this.otherMeals.map((m) => ({
			title: m.name,
			description: m.area,
			imgSrc: m.image,
			href: `/meal/${m.id}`,
		}))
	}
}
