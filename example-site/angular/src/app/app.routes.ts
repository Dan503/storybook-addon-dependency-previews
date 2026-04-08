import { Routes } from '@angular/router';
import { HomePageComponent } from '../components/05-pages/HomePage.component';
import { ContactPageComponent } from '../components/05-pages/ContactPage.component';

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
];
