import { Component } from '@angular/core'
import { RouterLink, RouterLinkActive } from '@angular/router'

@Component({
	selector: 'app-main-nav-molecule',
	standalone: true,
	imports: [RouterLink, RouterLinkActive],
	template: `
		<nav class="flex flex-row">
			<div class="px-2 font-bold">
				<a routerLink="/" routerLinkActive="underline" [routerLinkActiveOptions]="{ exact: true }">Home</a>
			</div>
			<div class="px-2 font-bold">
				<a routerLink="/categories" routerLinkActive="underline">Food categories</a>
			</div>
			<div class="px-2 font-bold">
				<a routerLink="/contact" routerLinkActive="underline">Contact us</a>
			</div>
		</nav>
	`,
})
export class MainNavMoleculeComponent {}
