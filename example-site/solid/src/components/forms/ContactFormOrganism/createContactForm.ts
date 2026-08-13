import { createForm, type ValidationMode } from '@formisch/solid'
import {
	contactFormSchema,
	defaultContactFormValues,
	type ContactFormOutputData,
} from 'example-site-shared/data'

export function createContactForm(validate: ValidationMode = 'submit') {
	return createForm({
		schema: contactFormSchema,
		initialInput: defaultContactFormValues,
		validate,
	})
}

export function onContactFormSubmit(output: ContactFormOutputData) {
	alert('Form submitted with these values:\n' + JSON.stringify(output, null, 2))
}
