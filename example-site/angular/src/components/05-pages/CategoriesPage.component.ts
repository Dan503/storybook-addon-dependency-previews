import { Component, signal } from '@angular/core';
import type { Category } from 'example-site-shared/data';
import { CardListTemplateComponent } from '../04-templates/CardListTemplate.component';
import { fetchCategories } from 'example-site-shared/utils/mealDbApiUtils';
import type { PropsForCardMolecule } from '../listings/card/CardMolecule.component';

@Component({
	selector: 'categories-page',
	template: `<card-list-template [cardList]="categories()" [title]="'Categories'" />`,
	standalone: true,
	imports: [CardListTemplateComponent],
})
export class CategoriesPageComponent {
	categories = signal<PropsForCardMolecule[]>([]);
	async ngOnInit() {
		const categoriesData: Category[] = await fetchCategories();
		const categoriesForCard: PropsForCardMolecule[] = categoriesData.map((category) => {
			return {
				title: category.strCategory,
				href: `/categories/${category.strCategory}`,
				imgSrc: category.strCategoryThumb,
				description: category.strCategoryDescription,
			} satisfies PropsForCardMolecule;
		});
		this.categories.set(categoriesForCard);
	}
}
