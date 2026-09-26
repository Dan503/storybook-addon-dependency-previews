import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

/**
 * Pads content in from the edges of the screen.
 *
 * @slot - the content to pad
 */
@customElement('app-screen-padding-atom')
export class ScreenPaddingAtom extends LitElement {
	/**
	 * Pad the top and bottom as well as the sides.
	 *
	 * Copied onto the tag as an attribute, which is what the style below reads.
	 */
	@property({ type: Boolean, reflect: true }) padVertical = false

	static override styles = css`
		:host {
			display: block;
			box-sizing: border-box;
			width: 100%;
			padding: 0 1.5rem;
		}

		:host([padvertical]) {
			padding: 1.5rem;
		}
	`

	override render() {
		return html`<slot></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-screen-padding-atom': ScreenPaddingAtom
	}
}
