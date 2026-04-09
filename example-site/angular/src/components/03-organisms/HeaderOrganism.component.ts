import { Component, input } from '@angular/core';
import { MainNavMoleculeComponent } from '../02-molecules/MainNavMolecule.component';
import { ScreenPaddingAtomComponent } from '../01-atoms/ScreenPaddingAtom.component';

@Component({
	selector: 'header-organism',
	host: {
		'[class]': `[ "HeaderOrganism", class() ].join(" ")`,
	},
	template: `
		<header class="border-b-2 border-teal-900 bg-teal-100 p-2 text-black">
			<screen-padding-atom>
				<div
					class="flex w-full items-center justify-between gap-2 max-md:flex-col max-md:justify-center"
				>
					<a href="/" class="flex items-center gap-2">
						<img src="/simplified-logo.png" alt="Logo" height="50" width="50" />
						<p class="text-3xl font-extrabold">The Meal Place</p>
					</a>
					<main-nav-molecule />
				</div>
			</screen-padding-atom>
		</header>
	`,
	standalone: true,
	imports: [MainNavMoleculeComponent, ScreenPaddingAtomComponent],
})
export class HeaderOrganismComponent {
	class = input<string>('');
}
