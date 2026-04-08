import { Component, computed, input } from '@angular/core';
import { SiteFrameOrganismComponent } from '../03-organisms/SiteFrameOrganism.component';
import { HeroBlockOrganismComponent } from '../03-organisms/HeroBlockOrganism.component';
import { ExternalLinkAtomComponent } from '../01-atoms/ExternalLinkAtom.component';
import { ScreenPaddingAtomComponent } from '../01-atoms/ScreenPaddingAtom.component';
import { CardListingOrganismComponent } from '../listings/card/CardListingOrganism.component';
import type { Meal } from 'example-site-shared/data';
import type { PropsForCardMolecule } from '../listings/card/CardMolecule.component';

@Component({
	selector: 'home-template',
	template: `
		@let featureMeal = allMeals()[0];
		@let otherMeals = allMeals().slice(1);
		<site-frame-organism>
			<div class="HomeTemplate">
				<hero-block-organism [imgSrc]="featureMeal?.imgSrc" [title]="titleTemplate">
					<ng-template #titleTemplate>
						Welcome to the
						<br />
						<external-link-atom
							href="https://github.com/Dan503/storybook-addon-dependency-previews"
						>
							Storybook Dependency Previews
						</external-link-atom>
						<br />
						example site
					</ng-template>

					<p class="text-center">
						This is an example site to demonstrate the dependency preview addon in a realistic
						environment.
					</p>
				</hero-block-organism>
				<screen-padding-atom [padVertical]="true">
					<h2 class="mb-4 text-2xl font-bold">Featured meals:</h2>
					<card-listing-organism [cards]="otherMeals" />
				</screen-padding-atom>
			</div>
		</site-frame-organism>
	`,
	standalone: true,
	imports: [
		SiteFrameOrganismComponent,
		HeroBlockOrganismComponent,
		ExternalLinkAtomComponent,
		ScreenPaddingAtomComponent,
		CardListingOrganismComponent,
	],
})
export class HomeTemplateComponent {
	class = input<string>('');
	featuredMeals = input<Array<Meal>>([]);
	protected allMeals = computed(() =>
		this.featuredMeals().map(
			(x) =>
				({
					title: x.name,
					description: x.area,
					imgSrc: x.image,
					href: `/meal/${x.id}`,
				}) satisfies PropsForCardMolecule,
		),
	);
}
