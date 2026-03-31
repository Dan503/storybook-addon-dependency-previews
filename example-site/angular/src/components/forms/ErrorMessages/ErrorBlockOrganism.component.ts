import { Component, input } from '@angular/core';
import { ErrorListMoleculeComponent } from './ErrorListMolecule.component';

@Component({
	selector: 'error-block-organism',
	host: { class: 'block', role: 'alert' },
	template: `
		@if (errors().length > 0) {
			<div [class]="'ErrorBlockOrganism rounded-xl bg-red-100 px-4 pt-2 ' + class()">
				<h2 class="border-b-2 border-red-800 pb-1 text-2xl font-bold">
					Please resolve the following errors
				</h2>
				<div class="pt-3 pb-4">
					<error-list-molecule [errors]="errors()" />
				</div>
			</div>
		}
	`,
	standalone: true,
	imports: [ErrorListMoleculeComponent],
})
export class ErrorBlockOrganismComponent {
	class = input<string>('');
	errors = input<Array<string | Error>>([]);
}
