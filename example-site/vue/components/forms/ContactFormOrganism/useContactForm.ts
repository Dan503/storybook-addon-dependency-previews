import { useForm, type ValidationMode } from '@formisch/vue'
import {
	contactFormSchema,
	defaultContactFormValues,
	type ContactFormOutputData,
} from 'example-site-shared/data'

export function onContactFormSubmit(output: ContactFormOutputData) {
	alert('Form submitted with these values:\n' + JSON.stringify(output, null, 2))
}

export function useContactForm(validate: ValidationMode = 'submit') {
	return useForm({
		schema: contactFormSchema,
		initialInput: defaultContactFormValues,
		validate,
	})
}
