import * as z from 'zod'

export const defaultContactFormValues = {
	name: '',
	email: '',
	message: '',
}

export const contactFormValuesSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.email('Invalid email address'),
	message: z.string().min(10, 'At least 10 characters are required'),
})

export type ContactFormValues = z.infer<typeof contactFormValuesSchema>
