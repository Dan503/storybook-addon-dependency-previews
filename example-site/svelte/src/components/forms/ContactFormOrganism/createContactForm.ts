import { createForm, type ValidationMode } from '@formisch/svelte';
import {
	contactFormSchema,
	defaultContactFormValues,
	type ContactFormOutputData
} from 'example-site-shared/data';

export function onContactFormSubmit(output: ContactFormOutputData) {
	alert('Form submitted with these values:\n' + JSON.stringify(output, null, 2));
}

export function createContactForm(validate: ValidationMode = 'submit') {
	return createForm({
		schema: contactFormSchema,
		initialInput: defaultContactFormValues,
		validate
	});
}
