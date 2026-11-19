import {
	Field,
	Form,
	getAllErrors,
	useSignals,
	type SubmitHandler,
} from '@formisch/react'
import type { ContactFormSchemaType } from 'example-site-shared/data'
import type { WithForm } from '../../model/FormTypes'
import { Button } from '../../../../../6-shared/ui/Button/Button'
import { ErrorBlock } from '../ErrorMessages/ErrorBlock'
import { TextArea } from '../TextArea/TextArea'
import { TextField } from '../TextField/TextField'
import styles from './ContactFormFields.module.css'

export interface PropsForContactFormFields extends WithForm<ContactFormSchemaType> {
	onSubmit: SubmitHandler<ContactFormSchemaType>
}

export function ContactFormFields({
	form,
	onSubmit,
}: PropsForContactFormFields) {
	// Draws this component again whenever the form's errors change.
	useSignals()
	const errors = getAllErrors(form)

	return (
		<div className={styles.contactFormFields}>
			<ErrorBlock errors={errors} />
			<Form className={styles.form} of={form} onSubmit={onSubmit}>
				<Field of={form} path={['name']}>
					{(field) => (
						<TextField label="Name" placeholder="Your name" field={field} />
					)}
				</Field>

				<Field of={form} path={['email']}>
					{(field) => (
						<TextField
							label="Email"
							placeholder="example@email.com"
							field={field}
						/>
					)}
				</Field>

				<Field of={form} path={['message']}>
					{(field) => (
						<TextArea
							label="Message"
							placeholder="Type your message here..."
							field={field}
						/>
					)}
				</Field>

				<div className={styles.actions}>
					<Button type="submit">Send</Button>
				</div>
			</Form>
		</div>
	)
}
