import { useForm, type ValidationMode } from '@formisch/preact'
import {
	contactFormSchema,
	defaultContactFormValues,
	type ContactFormOutputData,
} from 'example-site-shared/data'

export function useContactForm(validate: ValidationMode = 'submit') {
	return useForm({
		schema: contactFormSchema,
		initialInput: defaultContactFormValues,
		validate,
	})
}

export function onContactFormSubmit(output: ContactFormOutputData) {
	const indentSpaces = 2
	alert(
		'Form submitted with these values:\n' +
			JSON.stringify(output, null, indentSpaces),
	)
}
