import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { gridHostStyles } from '../lib/gridHostStyles'
import { setPageTitle } from '../lib/pageTitle'
import '../components/04-templates/ContactTemplate.lit'

/** The contact page. */
@customElement('app-contact-page')
export class ContactPage extends LitElement {
	static override styles = gridHostStyles

	override render() {
		setPageTitle('Contact Us | The Meal Place')
		return html`<app-contact-template></app-contact-template>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-contact-page': ContactPage
	}
}
