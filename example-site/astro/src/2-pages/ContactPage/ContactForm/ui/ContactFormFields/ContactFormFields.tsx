import { Field, Form, useSignals, type SubmitHandler } from '@formisch/react'
import type { ContactFormSchemaType } from 'example-site-shared/data'
import { Button } from '../../../../../6-shared/ui/Button/Button'
import type { WithForm } from '../../model/FormTypes'
import { TextArea } from '../TextArea/TextArea'
import { TextField } from '../TextField/TextField'
import styles from './ContactFormFields.module.css'

export interface PropsForContactFormFields extends WithForm<ContactFormSchemaType> {
	/** Runs when the form is sent with no errors. */
	onSubmit: SubmitHandler<ContactFormSchemaType>
}

/** The contact form's fields and send button, with a summary of any errors above them. */
export function ContactFormFields({
	form,
	onSubmit,
}: PropsForContactFormFields) {
	// Draws this component again whenever the form's errors change.
	useSignals()

	return (
		<div className={styles.contactFormFields}>
			{/* After working on the Accessibility for the demo site, I realised that ErrorBlock isn't needed due to the inline errors */}
			{/* <ErrorBlock errors={errors} /> */}
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
