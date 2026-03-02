import { Component, input } from '@angular/core'
import { ReactiveFormsModule, type AbstractControl } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { ErrorListMoleculeComponent } from '../ErrorMessages/ErrorListMolecule.component'

@Component({
	selector: 'app-text-area-molecule',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, ErrorListMoleculeComponent],
	templateUrl: './TextAreaMolecule.component.html',
})
export class TextAreaMoleculeComponent {
	label = input.required<string>()
	placeholder = input('')
	control = input<AbstractControl | null>(null)

	get errors() {
		const ctrl = this.control()
		if (!ctrl || !ctrl.errors || !ctrl.touched) return []
		return Object.values(ctrl.errors).map((e) =>
			typeof e === 'string' ? e : 'Invalid value',
		)
	}
}
