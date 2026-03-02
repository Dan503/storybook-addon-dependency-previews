import { Component, signal, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { fetchRandomMealList } from 'example-site-shared/utils/mealDbApiUtils'
import type { Meal } from 'example-site-shared/utils'
import { HomeTemplateComponent } from '../../components/04-templates/HomeTemplate.component'

@Component({
	selector: 'app-home-route',
	standalone: true,
	imports: [CommonModule, HomeTemplateComponent],
	template: `
		@if (featuredMeals()) {
			<app-home-template [featuredMeals]="featuredMeals()!" />
		} @else {
			<div class="grid place-items-center h-screen">
				<p class="text-xl">Loading...</p>
			</div>
		}
	`,
})
export class HomeRouteComponent implements OnInit {
	featuredMeals = signal<Array<Meal> | null>(null)

	async ngOnInit() {
		const meals = await fetchRandomMealList(7)
		this.featuredMeals.set(meals)
	}
}
