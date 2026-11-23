import { Field, Form, useSignals, type SubmitHandler } from '@formisch/react'
import type { ContactFormSchemaType } from 'example-site-shared/data'
import { Button } from '../../../../../6-shared/ui/Button/Button'
import type { WithForm } from '../../model/FormTypes'
import { TextArea } from '../TextArea/TextArea'
import { TextField } from '../TextField/TextField'
import styles from './ContactFormFields.module.css'
import { useHasJsLoaded } from '../../model/useHasJsLoaded'

export interface PropsForContactFormFields extends WithForm<ContactFormSchemaType> {
	/** Runs when the form is sent with no errors. */
	onSubmit: SubmitHandler<ContactFormSchemaType>
}

/**
 * The contact form's fields and send button, with a summary of any errors above them.
 * The send button stays off until the form's script has loaded.
 */
export function ContactFormFields({
	form,
	onSubmit,
}: PropsForContactFormFields) {
	// Draws this component again whenever the form's errors change.
	useSignals()
	const hasJsLoaded = useHasJsLoaded()

	return (
		<div className={styles.contactFormFields}>
			{/* After working on the Accessibility for the demo site, I realised that ErrorBlock isn't needed due to the inline errors */}
			{/* <ErrorBlock errors={errors} /> */}
			<Form className={styles.form} of={form} onSubmit={onSubmit}>
				<p>
					All fields are required. Name must be at least 2 characters. Message
					must be at least 10 characters.
				</p>

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
					<Button
						type="submit"
						disabledReason={!hasJsLoaded && 'Form is loading...'}
					>
						Send
					</Button>
				</div>
			</Form>
		</div>
	)
}
