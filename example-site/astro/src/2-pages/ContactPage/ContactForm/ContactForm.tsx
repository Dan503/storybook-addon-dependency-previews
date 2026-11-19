import { useState } from 'react'
import { useContactForm } from './model/useContactForm'
import { ContactFormFields } from './ui/ContactFormFields/ContactFormFields'
import { ThankYouMessage } from './ui/ThankYouMessage/ThankYouMessage'

/** The contact page's form. Swaps to a thank-you message once the form is sent, and back again when asked. */
export function ContactForm() {
	const form = useContactForm()
	const [isSubmitted, setIsSubmitted] = useState(false)

	if (isSubmitted) {
		return (
			<ThankYouMessage form={form} onBackClick={() => setIsSubmitted(false)} />
		)
	}

	return <ContactFormFields form={form} onSubmit={() => setIsSubmitted(true)} />
}
