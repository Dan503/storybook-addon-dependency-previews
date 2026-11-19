import type { ContactFormSchemaType } from 'example-site-shared/data'
import type { WithForm } from '../../model/FormTypes'
import { Button } from '../../../../../6-shared/ui/Button/Button'
import { FormDataPreview } from '../FormDataPreview/FormDataPreview'
import styles from './ThankYouMessage.module.css'

export interface PropsForThankYouMessage extends WithForm<ContactFormSchemaType> {
	onBackClick: () => void
}

/** Shown in place of the form once it is sent, with what the visitor sent. */
export function ThankYouMessage({
	form,
	onBackClick,
}: PropsForThankYouMessage) {
	return (
		<div className={styles.thankYouMessage}>
			<p>Thank you for your message!</p>
			<p>This website is just a demo so your message was not sent anywhere.</p>
			<p>Here is what you submitted:</p>
			<FormDataPreview form={form} />
			<div className={styles.actions}>
				<Button onClick={onBackClick}>Back to the contact form</Button>
			</div>
		</div>
	)
}
