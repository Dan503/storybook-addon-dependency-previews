import { LitElement, css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { cache } from 'lit/directives/cache.js'
import type { ContactFormOutputData } from 'example-site-shared/data'
import { baseStyles } from '../../lib/baseStyles'
import '../03-organisms/SiteFrameOrganism.lit'
import '../01-atoms/ContentRestraintAtom.lit'
import '../02-molecules/IconTextMolecule.lit'
import '../01-atoms/icons/PhoneIcon.lit'
import '../01-atoms/icons/MapPinIcon.lit'
import '../forms/ContactFormOrganism/ContactFormOrganism.lit'
import '../zz-meta-components/FormDataPreview/FormDataPreviewAtom.lit'
import '../01-atoms/ButtonAtom.lit'

/**
 * The contact page: how to reach the site, and a form to write to it.
 *
 * Once the form is sent, a thank-you message showing what was sent takes its
 * place, with a button back to the form. The form is kept while the message
 * shows, so going back finds what was typed still in it.
 */
@customElement('app-contact-template')
export class ContactTemplate extends LitElement {
	/** The values the form was sent with, or `null` while the form shows. */
	@state() private _sentValues: ContactFormOutputData | null = null

	private _showThankYou = (values: ContactFormOutputData) => {
		this._sentValues = values
	}

	private _showForm = () => {
		this._sentValues = null
	}

	static override styles = [
		baseStyles,
		css`
			:host {
				display: grid;
			}

			.centred {
				display: grid;
				height: 100%;
				place-items: center;
			}

			.ContactTemplate,
			.thankYou {
				display: grid;
				gap: 1rem;
			}

			h1 {
				font-size: 1.875rem;
				line-height: calc(2.25 / 1.875);
				font-weight: 700;
			}

			.backButton {
				display: flex;
				justify-content: flex-start;
			}
		`,
	]

	override render() {
		// cache keeps the form, and what was typed in it, while the thank-you
		// message is showing, instead of throwing it away and drawing a new one.
		const formOrThankYou = cache(
			this._sentValues
				? this._renderThankYou(this._sentValues)
				: html`<app-contact-form-organism
						.onSubmit=${this._showThankYou}
					></app-contact-form-organism>`,
		)
		return html`<app-site-frame-organism>
			<div class="centred">
				<app-content-restraint-atom padVertical>
					<div class="ContactTemplate">
						<h1>Contact Us</h1>
						<app-icon-text-molecule>
							<app-phone-icon slot="icon"></app-phone-icon>
							0412 345 678
						</app-icon-text-molecule>
						<app-icon-text-molecule>
							<app-map-pin-icon slot="icon"></app-map-pin-icon>
							123 Main St, Anytown, Australia
						</app-icon-text-molecule>
						${formOrThankYou}
					</div>
				</app-content-restraint-atom>
			</div>
		</app-site-frame-organism>`
	}

	private _renderThankYou(sentValues: ContactFormOutputData) {
		return html`<div class="thankYou">
			<p>Thank you for your message!</p>
			<p>This website is just a demo so your message was not sent anywhere.</p>
			<p>Here is what you submitted:</p>
			<app-form-data-preview-atom
				.values=${sentValues}
			></app-form-data-preview-atom>
			<div class="backButton">
				<app-button-atom .onClick=${this._showForm}>
					Back to the contact form
				</app-button-atom>
			</div>
		</div>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-contact-template': ContactTemplate
	}
}
