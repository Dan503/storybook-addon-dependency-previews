import * as v from 'valibot'

export const defaultContactFormValues: ContactFormInputData = {
	name: '',
	email: '',
	message: '',
}

export const exampleContactFormValues: ContactFormInputData = {
	name: 'John Doe',
	email: 'john.doe@example.com',
	message: 'Hello, this is a sample message.',
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
		v.nonEmpty('Please write a message.'),
		v.minLength(10, 'At least 10 characters are required'),
	),
})

export type ContactFormSchemaType = typeof contactFormSchema

// This is the type before applying transformations and defaults
export type ContactFormInputData = v.InferInput<ContactFormSchemaType>

// This is the type after applying transformations and defaults
// In this case, there are no transformations or defaults, so it's the same as ContactFormInputData
export type ContactFormOutputData = v.InferOutput<ContactFormSchemaType>

// The one-field forms below are for the text field and text area stories.
// They take their field straight from the contact form, so they always check
// the same rules as the real form.

export const defaultNameOnlyValues: Partial<NameOnlyInputData> = {
	name: '',
}

export const nameOnlySchema = v.pick(contactFormSchema, ['name'])

export type NameOnlySchemaType = typeof nameOnlySchema
export type NameOnlyInputData = v.InferInput<NameOnlySchemaType>
export type NameOnlyOutputData = v.InferOutput<NameOnlySchemaType>

export const defaultMessageOnlyValues: Partial<MessageOnlyInputData> = {
	message: '',
}

export const messageOnlySchema = v.pick(contactFormSchema, ['message'])

export type MessageOnlySchemaType = typeof messageOnlySchema
export type MessageOnlyInputData = v.InferInput<MessageOnlySchemaType>
export type MessageOnlyOutputData = v.InferOutput<MessageOnlySchemaType>
