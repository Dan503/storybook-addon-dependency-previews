import { Component, signal, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { fetchCategories } from 'example-site-shared/utils/mealDbApiUtils'
import type { Category } from 'example-site-shared/utils'
import { CardListTemplateComponent } from '../../components/04-templates/CardListTemplate.component'

@Component({
	selector: 'app-categories-route',
	standalone: true,
	imports: [CommonModule, CardListTemplateComponent],
	template: `
		<app-card-list-template
			title="Food categories"
			[cardList]="cardList()"
		/>
	`,
})
export class CategoriesRouteComponent implements OnInit {
	categories = signal<Array<Category>>([])

	cardList = signal<Array<{ title: string; description: string; imgSrc: string; href: string }>>([])

	async ngOnInit() {
		const cats = await fetchCategories()
		this.categories.set(cats)
		this.cardList.set(
			cats.map((c) => ({
				title: c.strCategory,
				description: c.strCategoryDescription,
				imgSrc: c.strCategoryThumb,
				href: `/category/${c.strCategory}`,
			})),
		)
	}
}
