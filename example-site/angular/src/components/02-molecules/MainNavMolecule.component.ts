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
	 * They sit here as values so that `routerLink` can be written as a binding and
	 * checked against the shared routes. Written as plain text in the markup —
	 * `routerLink="/contact"` — a misspelt page is accepted and only shows itself
	 * when someone clicks the link.
	 *
	 * Only routes with nothing changing in them can be listed. One like
	 * `/meal/:mealId` is a pattern rather than an address, so it would have to have
	 * its piece filled in before the router could follow it.
	 */
	protected readonly routes = {
		home: '/',
		categories: '/categories',
		contact: '/contact',
	} satisfies Record<string, ColonRouteTemplate>;
}
