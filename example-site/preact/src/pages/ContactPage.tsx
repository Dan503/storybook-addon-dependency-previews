import { ContactTemplate } from '../components/04-templates/ContactTemplate'
import { setPageTitle } from '../lib/pageTitle'

export function ContactPage() {
	setPageTitle('Contact Us | The Meal Place')
	return <ContactTemplate />
}
