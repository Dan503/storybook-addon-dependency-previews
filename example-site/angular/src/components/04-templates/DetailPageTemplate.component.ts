import { Component, input } from '@angular/core';
import { SiteFrameOrganismComponent } from '../03-organisms/SiteFrameOrganism.component';
import { ScreenPaddingAtomComponent } from '../01-atoms/ScreenPaddingAtom.component';
import { ButtonAtomComponent } from '../01-atoms/ButtonAtom.component';
import { CompactListingOrganismComponent } from '../listings/compact/CompactListingOrganism.component';
import { Meal } from 'example-site-shared/data';

@Component({
	selector: 'detail-page-template',
	template: `
		<site-frame-organism>
			<screen-padding-atom [padVertical]="true">
				@if (isLoading()) {
					<p>Loading...</p>
				} @else if (meal()) {
					<h1 class="mb-5 text-3xl font-bold">{{ meal()!.name }}</h1>
					<div class="grid gap-4 lg:grid-cols-[2fr_30rem]">
						<div class="grid gap-4 sm:grid-cols-[1fr_2fr]">
							<img [src]="meal()!.image" [alt]="meal()!.name" class="mt-2" />
							<div>
								<h2 class="text-2xl font-bold">Recipe</h2>
								<p class="whitespace-pre-wrap">{{ meal()!.instructions }}</p>
							</div>
						</div>
						<div class="grid grid-rows-[auto_1fr] items-start gap-4">
							<h2 class="text-2xl font-bold">Ingredients</h2>
							<compact-listing-organism
								[items]="meal()!.ingredients.map((x) => ({
									title: x.ingredient,
									description: x.amount,
									imageSrc: x.imageUrl.small
								}))"
							/>
						</div>
					</div>
				} @else {
					<p>Meal not found.</p>
				}
			</screen-padding-atom>
		</site-frame-organism>
	`,
	standalone: true,
	imports: [
		SiteFrameOrganismComponent,
		ScreenPaddingAtomComponent,
		ButtonAtomComponent,
		CompactListingOrganismComponent,
	],
})
export class DetailPageTemplateComponent {
	class = input<string>('');
	isLoading = input<boolean>(false);
	meal = input<Meal | null>(null);
}
