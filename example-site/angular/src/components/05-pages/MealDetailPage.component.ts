import { Component, inject, signal } from '@angular/core';
import { DetailPageTemplateComponent } from '../04-templates/DetailPageTemplate.component';
import { ActivatedRoute } from '@angular/router';
import type { Meal } from 'example-site-shared/data';
import { fetchMealById } from 'example-site-shared/utils/mealDbApiUtils';

@Component({
	selector: 'meal-detail-page',
	template: `<detail-page-template [meal]="meal()" [isLoading]="isLoading()" />`,
	standalone: true,
	imports: [DetailPageTemplateComponent],
})
export class MealDetailPageComponent {
	private route = inject(ActivatedRoute);
	meal = signal<Meal | null>(null);
	isLoading = signal<boolean>(true);
	async ngOnInit() {
		const mealId: string = this.route.snapshot.params['mealId'];
		try {
			const mealData: Meal | null = await fetchMealById(mealId);
			this.meal.set(mealData ?? null);
		} finally {
			this.isLoading.set(false);
		}
	}
}
