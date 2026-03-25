import { Component, input } from '@angular/core';
import { ExternalLinkIconComponent } from './icons/ExternalLinkIcon.component';

@Component({
	selector: 'external-link-atom',
	template: `
		<a
			[class]="
				'ExternalLinkAtom inline-flex items-center gap-1 text-teal-700 underline hover:text-teal-900 hover:no-underline focus:no-underline ' +
				class()
			"
			target="_blank"
			rel="noopener noreferrer"
			[href]="href()"
			title="Opens in new tab"
		>
			<ng-content />
			<external-link-icon class="h-[1em] w-[1em]" />
		</a>
	`,
	standalone: true,
	imports: [ExternalLinkIconComponent],
})
export class ExternalLinkAtomComponent {
	class = input<string>('');
	href = input<string>('');
}
