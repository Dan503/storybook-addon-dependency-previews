import { Component, input } from '@angular/core'
import { ExternalLinkIconComponent } from './icons/ExternalLinkIcon.component'

@Component({
	selector: 'app-external-link-atom',
	standalone: true,
	imports: [ExternalLinkIconComponent],
	template: `
		<a
			[href]="href()"
			target="_blank"
			rel="noopener noreferrer"
			class="inline-flex items-center gap-1 underline"
		>
			<ng-content />
			<app-external-link-icon />
		</a>
	`,
})
export class ExternalLinkAtomComponent {
	href = input.required<string>()
}
