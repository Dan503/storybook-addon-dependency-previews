import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardListTemplateComponent } from '../04-templates/CardListTemplate.component';
import type { PropsForCardMolecule } from '../listings/card/CardMolecule.component';
import type { Meal } from 'example-site-shared/data';
import { fetchMealsByCategory } from 'example-site-shared/utils/mealDbApiUtils';

@Component({
	selector: 'category-listing-page',
	template: `<card-list-template
		[cardList]="meals()"
		[title]="title() + ' Meals'"
		[introText]="'Explore these delicious ' + title() + ' meals!'"
	/>`,
	standalone: true,
	imports: [CardListTemplateComponent],
})
export class CategoryListingPageComponent {
	private route = inject(ActivatedRoute);
	meals = signal<PropsForCardMolecule[]>([]);
	title = signal<string>('');
	async ngOnInit() {
		const categoryName: string = this.route.snapshot.params['categoryName'];
		this.title.set(categoryName);
		const mealsData: Meal[] = await fetchMealsByCategory(categoryName);
		const mealsForCard: PropsForCardMolecule[] = mealsData.map((meal) => {
			return {
				title: meal.name,
				href: `/meal/${meal.id}`,
				imgSrc: meal.image,
				description: meal.area,
			} satisfies PropsForCardMolecule;
		});
		this.meals.set(mealsForCard);
	}
}
