import { Routes } from '@angular/router';
import { HomePageComponent } from '../components/05-pages/HomePage.component';
import { ContactPageComponent } from '../components/05-pages/ContactPage.component';
import { CategoriesPageComponent } from '../components/05-pages/CategoriesPage.component';
import { CategoryListingPageComponent } from '../components/05-pages/CategoryListingPage.component';
import { MealDetailPageComponent } from '../components/05-pages/MealDetailPage.component';

export const routes: Routes = [
	{
		title: 'Home',
		path: '',
		component: HomePageComponent,
	},
	{
		title: 'Contact',
		path: 'contact-us',
		component: ContactPageComponent,
	},
	{
		title: 'Categories',
		path: 'categories',
		component: CategoriesPageComponent,
	},
	{
		path: 'categories/:categoryName',
		component: CategoryListingPageComponent,
	},
	{
		path: 'meal/:mealId',
		component: MealDetailPageComponent,
	},
];
