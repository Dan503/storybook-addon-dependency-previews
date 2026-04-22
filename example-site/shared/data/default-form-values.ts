import * as v from 'valibot'

export const defaultContactFormValues: ContactFormInput = {
	name: '',
	email: '',
	message: '',
}

export const contactFormSchema = v.object({
	name: v.pipe(
		v.string(),
		v.nonEmpty('Please enter your name.'),
		v.minLength(2, 'Name must be at least 2 characters long'),
	),
	email: v.pipe(
		v.string(),
		v.nonEmpty('Please enter your email.'),
		v.email('Invalid email address'),
	),
	message: v.pipe(
		v.string(),
		v.nonEmpty('Please write your message here.'),
		v.minLength(10, 'At least 10 characters are required'),
	),
})

// This is the type before applying transformations and defaults
export type ContactFormInput = v.InferInput<typeof contactFormSchema>

// This is the type after applying transformations and defaults
// In this case, there are no transformations or defaults, so it's the same as ContactFormInput
export type ContactFormOutput = v.InferOutput<typeof contactFormSchema>
