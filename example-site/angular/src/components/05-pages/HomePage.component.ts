import { Component, signal } from '@angular/core';
import { HomeTemplateComponent } from '../04-templates/HomeTemplate.component';
import { fetchRandomMealList } from 'example-site-shared/utils/mealDbApiUtils';
import type { Meal } from 'example-site-shared/utils/mealDbApiUtils';

@Component({
	selector: 'home-page',
	template: `<home-template [featuredMeals]="featuredMeals()" />`,
	standalone: true,
	imports: [HomeTemplateComponent],
})
export class HomePageComponent {
	featuredMeals = signal<Meal[]>([]);
	async ngOnInit() {
		this.featuredMeals.set(await fetchRandomMealList(7));
	}
}
