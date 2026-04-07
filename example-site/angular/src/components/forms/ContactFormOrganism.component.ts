import { Component, effect, output } from '@angular/core';
import { injectForm, injectStore } from '@tanstack/angular-form';
import { defaultContactFormValues, type ContactFormValues } from 'example-site-shared/data';
import { TextFieldMoleculeComponent } from './TextFieldMolecule/TextFieldMolecule.component';
import { TextAreaMoleculeComponent } from './TextAreaMolecule/TextAreaMolecule.component';
import { ButtonAtomComponent } from '../01-atoms/ButtonAtom.component';

@Component({
	selector: 'contact-form-organism',
	standalone: true,
	imports: [TextFieldMoleculeComponent, TextAreaMoleculeComponent, ButtonAtomComponent],
	template: `
		<form (submit)="handleSubmit($event)" class="ContactFormOrganism grid gap-4">
			<text-field-molecule
				label="Name"
				placeholder="Your name"
				[tanstackField]="form"
				name="name"
				[validators]="nameValidators"
			/>
			<text-field-molecule
				label="Email"
				placeholder="example@email.com"
				[tanstackField]="form"
				name="email"
				[validators]="emailValidators"
			/>
			<text-area-molecule
				label="Message"
				placeholder="Type your message here..."
				[tanstackField]="form"
				name="message"
				[validators]="messageValidators"
			/>
			<div class="flex justify-end">
				<button-atom type="submit">Send</button-atom>
			</div>
		</form>
	`,
})
export class ContactFormOrganismComponent {
	onSubmit = output<void>();
	valuesChange = output<ContactFormValues>();

	form = injectForm({
		defaultValues: defaultContactFormValues,
		onSubmit: async () => this.onSubmit.emit(),
	});

	private formValues = injectStore(this.form, (s) => s.values);

	nameValidators = {
		onChange: ({ value }: { value: string }) => (!value ? 'Name is required' : undefined),
	};

	emailValidators = {
		onChange: ({ value }: { value: string }) => {
			if (!value) return 'Email is required';
			if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email address';
			return undefined;
		},
	};

	messageValidators = {
		onChange: ({ value }: { value: string }) => {
			if (!value) return 'Message is required';
			if (value.length < 10) return 'At least 10 characters are required';
			return undefined;
		},
	};

	constructor() {
		effect(() => {
			this.valuesChange.emit(this.formValues() as ContactFormValues);
		});
	}

	handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		this.form.handleSubmit();
	}
}
