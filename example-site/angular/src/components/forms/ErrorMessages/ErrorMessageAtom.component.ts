import { Component, input } from '@angular/core';

@Component({
	selector: 'error-message-atom',
	template: `
		<p [class]="'ErrorMessageAtom text-red-900 font-bold leading-none ' + class()">
			{{ errorObject()?.message ?? errorString() ?? 'An error occurred' }}
		</p>
	`,
	standalone: true,
	imports: [],
})
export class ErrorMessageAtomComponent {
	class = input<string>('');
	errorString = input<string>();
	errorObject = input<Error>();
}
