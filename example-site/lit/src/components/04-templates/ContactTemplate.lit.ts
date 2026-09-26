import { LitElement, css, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { baseStyles } from '../../lib/baseStyles'
import '../03-organisms/SiteFrameOrganism.lit'
import '../01-atoms/ContentRestraintAtom.lit'
import '../02-molecules/IconTextMolecule.lit'
import '../01-atoms/icons/PhoneIcon.lit'
import '../01-atoms/icons/MapPinIcon.lit'

/** The contact page: how to reach the site, and a form to write to it. */
@customElement('app-contact-template')
export class ContactTemplate extends LitElement {
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

			.ContactTemplate {
				display: grid;
				gap: 1rem;
			}

			h1 {
				font-size: 1.875rem;
				line-height: calc(2.25 / 1.875);
				font-weight: 700;
			}
		`,
	]

	override render() {
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
						<!-- TODO: the contact form goes here, and the thank-you message
						that replaces it once it is sent. The form arrives in PR 3 of the
						Lit line. -->
					</div>
				</app-content-restraint-atom>
			</div>
		</app-site-frame-organism>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-contact-template': ContactTemplate
	}
}
