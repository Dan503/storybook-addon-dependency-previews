import { Component, input } from '@angular/core';
import { ExternalLinkAtomComponent } from '../01-atoms/ExternalLinkAtom.component';

@Component({
	selector: 'footer-organism',
	host: {
		'[class]': `[
			"FooterOrganism",
			"border-t-2",
			"border-teal-900",
			"bg-teal-200",
			"p-4",
			"text-center",
			"text-black",
			class()
		].join(" ")`,
	},
	template: `
		<p>
			Meal data provided by
			<external-link-atom href="https://www.themealdb.com/">
				TheMealDB.com
			</external-link-atom>
		</p>
	`,
	standalone: true,
	imports: [ExternalLinkAtomComponent],
})
export class FooterOrganismComponent {
	class = input<string>('');
}
