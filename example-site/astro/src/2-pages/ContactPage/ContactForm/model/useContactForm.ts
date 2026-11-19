import { useForm, type ValidationMode } from '@formisch/react'
import {
	contactFormSchema,
	defaultContactFormValues,
} from 'example-site-shared/data'

/** Creates the contact form: it holds the values and errors, and checks the values against the shared rules. */
export function useContactForm(validate: ValidationMode = 'submit') {
	return useForm({
		schema: contactFormSchema,
		initialInput: defaultContactFormValues,
		validate,
	})
}
