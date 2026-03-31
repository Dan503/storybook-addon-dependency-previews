import { Component, computed, input } from '@angular/core';

@Component({
	selector: 'error-message-atom',
	host: { class: 'block' },
	template: `
		<p [class]="'ErrorMessageAtom text-red-900 font-bold leading-none ' + class()">
			{{ errorMessage() }}
		</p>
	`,
	standalone: true,
	imports: [],
})
export class ErrorMessageAtomComponent {
	class = input<string>('');
	error = input<string | Error>();
	errorMessage = computed(() => {
		const err = this.error();
		if (typeof err === 'string') {
			return err;
		}
		if (err instanceof Error) {
			return err.message;
		}
		return 'An error occurred';
	});
}
