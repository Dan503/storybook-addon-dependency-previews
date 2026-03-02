import { Routes } from '@angular/router'

export const routes: Routes = [
	{
		path: '',
		loadComponent: () =>
			import('../routes/home/home.component').then((m) => m.HomeRouteComponent),
	},
	{
		path: 'categories',
		loadComponent: () =>
			import('../routes/categories/categories.component').then(
				(m) => m.CategoriesRouteComponent,
			),
	},
	{
		path: 'contact',
		loadComponent: () =>
			import('../routes/contact/contact.component').then(
				(m) => m.ContactRouteComponent,
			),
	},
	{
		path: 'meal/:mealId',
		loadComponent: () =>
			import('../routes/meal/meal.component').then(
				(m) => m.MealRouteComponent,
			),
	},
]
