import { LitElement, css, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { setPageTitle } from '../lib/pageTitle'
import '../components/04-templates/ContactTemplate.lit'

/** The contact page. */
@customElement('app-contact-page')
export class ContactPage extends LitElement {
	static override styles = css`
		:host {
			display: grid;
		}
	`

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
