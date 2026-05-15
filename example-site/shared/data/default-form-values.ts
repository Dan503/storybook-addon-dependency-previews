import * as v from 'valibot'

export const defaultContactFormValues: Partial<ContactFormInputData> = {
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

export type ContactFormSchemaType = typeof contactFormSchema

// This is the type before applying transformations and defaults
export type ContactFormInputData = v.InferInput<ContactFormSchemaType>

// This is the type after applying transformations and defaults
// In this case, there are no transformations or defaults, so it's the same as ContactFormInputData
export type ContactFormOutputData = v.InferOutput<ContactFormSchemaType>

export const defaultFirstNameOnlyValues: Partial<FirstNameOnlyInputData> = {
	firstName: '',
}

export const firstNameOnlySchema = v.object({
	firstName: v.pipe(
		v.string(),
		v.nonEmpty('Please enter your name.'),
		v.minLength(2, 'Name must be at least 2 characters long'),
	),
})

export type FirstNameOnlySchemaType = typeof firstNameOnlySchema
export type FirstNameOnlyInputData = v.InferInput<FirstNameOnlySchemaType>
export type FirstNameOnlyOutputData = v.InferOutput<FirstNameOnlySchemaType>

export const defaultMessageOnlyValues: Partial<MessageOnlyInputData> = {
	message: '',
}

export const messageOnlySchema = v.object({
	message: v.pipe(
		v.string(),
		v.nonEmpty('Please write your message here.'),
		v.minLength(10, 'At least 10 characters are required'),
	),
})

export type MessageOnlySchemaType = typeof messageOnlySchema
export type MessageOnlyInputData = v.InferInput<MessageOnlySchemaType>
export type MessageOnlyOutputData = v.InferOutput<MessageOnlySchemaType>
