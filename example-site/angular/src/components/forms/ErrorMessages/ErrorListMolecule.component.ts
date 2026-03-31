import { Component, input } from '@angular/core';
import { ErrorMessageAtomComponent } from './ErrorMessageAtom.component';

@Component({
	selector: 'error-list-molecule',
	template: `
		@if (errors().length > 0) {
			<ul [class]="'ErrorListMolecule grid gap-1 pl-6 ' + class()">
				@for (err of errors(); track $index) {
					<li class="list-outside list-disc">
						<error-message-atom [error]="err" />
					</li>
				}
			</ul>
		}
	`,
	standalone: true,
	imports: [ErrorMessageAtomComponent],
})
export class ErrorListMoleculeComponent {
	class = input<string>('');
	errors = input<Array<string | Error>>([]);
}
