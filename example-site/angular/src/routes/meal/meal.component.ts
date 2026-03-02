import { Component, signal, OnInit, inject } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { fetchMealById } from 'example-site-shared/utils/mealDbApiUtils'
import type { Meal } from 'example-site-shared/utils'
import { DetailPageTemplateComponent } from '../../components/04-templates/DetailPageTemplate.component'

@Component({
	selector: 'app-meal-route',
	standalone: true,
	imports: [DetailPageTemplateComponent],
	template: `<app-detail-page-template [meal]="meal()" [isLoading]="isLoading()" />`,
})
export class MealRouteComponent implements OnInit {
	private route = inject(ActivatedRoute)
	meal = signal<Meal | null>(null)
	isLoading = signal(true)

	async ngOnInit() {
		const mealId = this.route.snapshot.paramMap.get('mealId') ?? ''
		const meal = await fetchMealById(mealId)
		this.meal.set(meal ?? null)
		this.isLoading.set(false)
	}
}
