import { Component, input } from '@angular/core'

@Component({
	selector: 'app-error-message-atom',
	standalone: true,
	template: `
		<p class="text-red-600 text-sm">{{ message() }}</p>
	`,
})
export class ErrorMessageAtomComponent {
	message = input.required<string>()
}
