import { Component, computed, effect, input, output } from '@angular/core';
import { injectForm, injectStore } from '@tanstack/angular-form';
import { defaultContactFormValues, type ContactFormValues } from 'example-site-shared/data';
import { TextFieldMoleculeComponent } from './TextFieldMolecule/TextFieldMolecule.component';
import { TextAreaMoleculeComponent } from './TextAreaMolecule/TextAreaMolecule.component';
import { ButtonAtomComponent } from '../01-atoms/ButtonAtom.component';
import { ErrorBlockOrganismComponent } from './ErrorMessages/ErrorBlockOrganism.component';

@Component({
	selector: 'contact-form-organism',
	host: { '[class]': '["ContactFormOrganism", class()].join(" ")' },
	standalone: true,
	imports: [
		TextFieldMoleculeComponent,
		TextAreaMoleculeComponent,
		ButtonAtomComponent,
		ErrorBlockOrganismComponent,
	],
	template: `
		<form (submit)="handleSubmit($event)" class="grid gap-4">
			@if (hasErrors()) {
				<error-block-organism [errors]="errors()" />
			}
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
	class = input<string>('');
	onSubmit = output<void>();
	valuesChange = output<ContactFormValues>();

	form = injectForm({
		defaultValues: defaultContactFormValues,
		onSubmit: async () => this.onSubmit.emit(),
	});

	private formFieldMeta = injectStore(this.form, (s) => s.fieldMeta);
	private formSubmissionAttempts = injectStore(this.form, (s) => s.submissionAttempts);
	private formValues = injectStore(this.form, (s) => s.values);

	errors = computed(() => {
		const fieldMeta = this.formFieldMeta();
		if (!fieldMeta) return [];
		return Object.values(fieldMeta).flatMap((meta: any) => [
			...new Set<string | Error>((meta.errors ?? []).filter(Boolean)),
		]);
	});

	hasErrors = computed(() => this.formSubmissionAttempts() > 0 && this.errors().length > 0);

	private validateName = ({ value }: { value: string }) =>
		!value ? 'Name is required' : undefined;

	private validateEmail = ({ value }: { value: string }) => {
		if (!value) return 'Email is required';
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email address';
		return undefined;
	};

	private validateMessage = ({ value }: { value: string }) => {
		if (!value) return 'Message is required';
		if (value.length < 10) return 'At least 10 characters are required';
		return undefined;
	};

	nameValidators = { onChange: this.validateName, onSubmit: this.validateName };
	emailValidators = { onChange: this.validateEmail, onSubmit: this.validateEmail };
	messageValidators = { onChange: this.validateMessage, onSubmit: this.validateMessage };

	constructor() {
		effect(() => {
			this.valuesChange.emit(this.formValues() as ContactFormValues);
		});
	}

	handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		this.form.handleSubmit();
		console.log('errors:', this.errors());
	}
}
