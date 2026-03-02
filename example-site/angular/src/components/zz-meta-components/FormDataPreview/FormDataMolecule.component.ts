import { Component, input } from '@angular/core'
import { FormDataPreviewAtomComponent } from './FormDataPreviewAtom.component'

@Component({
	selector: 'app-form-data-molecule',
	standalone: true,
	imports: [FormDataPreviewAtomComponent],
	templateUrl: './FormDataMolecule.component.html',
})
export class FormDataMoleculeComponent {
	formValues = input<unknown>({})
}
