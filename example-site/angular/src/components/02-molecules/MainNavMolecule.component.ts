import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
	selector: 'main-nav-molecule',
	template: `
		<nav class="flex gap-4 font-bold">
			<a
				routerLink="/"
				class="hover:underline"
				routerLinkActive="underline"
				[routerLinkActiveOptions]="{ exact: true }"
				>Home</a
			>
			<a routerLink="/categories" class="hover:underline" routerLinkActive="underline"
				>Food categories</a
			>
			<a routerLink="/contact-us" class="hover:underline" routerLinkActive="underline"
				>Contact us</a
			>
		</nav>
	`,
	standalone: true,
	imports: [RouterLink, RouterLinkActive],
})
export class MainNavMoleculeComponent {}
