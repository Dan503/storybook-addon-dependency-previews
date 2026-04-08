import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
	selector: 'main-nav-molecule',
	template: `
		<nav class="flex gap-4 font-bold">
			<a routerLink="/" routerLinkActive="underline" [routerLinkActiveOptions]="{ exact: true }"
				>Home</a
			>
			<a routerLink="/categories" routerLinkActive="underline">Food categories</a>
			<a routerLink="/contact-us" routerLinkActive="underline">Contact us</a>
		</nav>
	`,
	standalone: true,
	imports: [RouterLink, RouterLinkActive],
})
export class MainNavMoleculeComponent {}
