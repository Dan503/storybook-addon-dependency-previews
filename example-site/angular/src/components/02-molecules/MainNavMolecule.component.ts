import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import type { ColonRouteTemplate } from 'example-site-shared/utils';

@Component({
	selector: 'main-nav-molecule',
	template: `
		<nav class="flex gap-4 font-bold">
			<a
				[routerLink]="routes.home"
				class="hover:underline"
				routerLinkActive="underline"
				[routerLinkActiveOptions]="{ exact: true }"
				>Home</a
			>
			<a [routerLink]="routes.categories" class="hover:underline" routerLinkActive="underline"
				>Food categories</a
			>
			<a [routerLink]="routes.contact" class="hover:underline" routerLinkActive="underline"
				>Contact us</a
			>
		</nav>
	`,
	standalone: true,
	imports: [RouterLink, RouterLinkActive],
})
export class MainNavMoleculeComponent {
	/**
	 * The pages this nav links to.
	 *
	 * They sit here as values so that the markup can bind to something typed. It is
	 * this list that does the checking, not the binding: the router's own input
	 * accepts any string, so `routerLink="/contact"` written as plain text — or
	 * bound to a plain string — takes a misspelt page happily, and it shows itself
	 * only when someone clicks the link.
	 *
	 * Only routes with nothing changing in them belong here. One like
	 * `/meal/:mealId` is a pattern rather than an address, so it would need its
	 * piece filled in before the router could follow it — but that is a convention,
	 * not something the type below refuses.
	 */
	protected readonly routes = {
		home: '/',
		categories: '/categories',
		contact: '/contact',
	} satisfies Record<string, ColonRouteTemplate>;
}
