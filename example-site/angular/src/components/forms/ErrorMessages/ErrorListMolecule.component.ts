import { Component, input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ErrorMessageAtomComponent } from './ErrorMessageAtom.component'

@Component({
	selector: 'app-error-list-molecule',
	standalone: true,
	imports: [CommonModule, ErrorMessageAtomComponent],
	template: `
		@for (err of errors(); track err) {
			<app-error-message-atom [message]="err" />
		}
	`,
})
export class ErrorListMoleculeComponent {
	errors = input<Array<string>>([])
}
