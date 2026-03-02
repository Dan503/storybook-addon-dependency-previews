import { Component, output, OnInit, inject } from '@angular/core'
import {
	FormBuilder,
	ReactiveFormsModule,
	Validators,
	type FormGroup,
} from '@angular/forms'
import type { ContactFormValues } from 'example-site-shared/data'
import { defaultContactFormValues } from 'example-site-shared/data'
import { ButtonAtomComponent } from '../../01-atoms/ButtonAtom.component'
import { TextFieldMoleculeComponent } from '../TextFieldMolecule/TextFieldMolecule.component'
import { TextAreaMoleculeComponent } from '../TextAreaMolecule/TextAreaMolecule.component'

@Component({
	selector: 'app-contact-form-organism',
	standalone: true,
	imports: [
		ReactiveFormsModule,
		ButtonAtomComponent,
		TextFieldMoleculeComponent,
		TextAreaMoleculeComponent,
	],
	templateUrl: './ContactFormOrganism.component.html',
})
export class ContactFormOrganismComponent implements OnInit {
	formSubmitted = output<void>()
	valuesChange = output<ContactFormValues>()

	private fb = inject(FormBuilder)

	form!: FormGroup

	ngOnInit() {
		this.form = this.fb.group({
			name: [defaultContactFormValues.name, [Validators.required]],
			email: [defaultContactFormValues.email, [Validators.required, Validators.email]],
			message: [defaultContactFormValues.message, [Validators.required, Validators.minLength(10)]],
		})

		this.form.valueChanges.subscribe((values: ContactFormValues) => {
			this.valuesChange.emit(values)
		})
	}

	onSubmit() {
		this.form.markAllAsTouched()
		if (this.form.valid) {
			this.formSubmitted.emit()
		}
	}
}
