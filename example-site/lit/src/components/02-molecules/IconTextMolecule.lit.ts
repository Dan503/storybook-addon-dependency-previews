import { LitElement, css, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { baseStyles } from '../../lib/baseStyles'

/**
 * A line of text with an icon in front of it, such as a phone number or an
 * address.
 *
 * The icon comes out the size of the text by itself, so nothing here sizes it.
 *
 * @slot icon - the icon, such as `<app-phone-icon>`
 * @slot - the text
 */
@customElement('app-icon-text-molecule')
export class IconTextMolecule extends LitElement {
	static override styles = [
		baseStyles,
		css`
			:host {
				display: block;
			}

			p {
				display: flex;
				align-items: center;
				gap: 0.25rem;
				font-size: 1.125rem;
				line-height: calc(1.75 / 1.125);
				font-weight: 500;
				color: var(--globalColor_gray900);
			}
		`,
	]

	override render() {
		return html`<p class="IconTextMolecule">
			<slot name="icon"></slot>
			<slot></slot>
		</p>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-icon-text-molecule': IconTextMolecule
	}
}
