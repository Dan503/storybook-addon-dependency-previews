import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { baseStyles } from '../../lib/baseStyles'

/**
 * The site's button.
 *
 * It takes no click handler: listen for `click` on the tag itself. A click on
 * the button inside travels out of the component and is reported as coming
 * from the tag, and the button is all there is inside it, so the two mean the
 * same thing.
 *
 * @slot - the button's label
 */
@customElement('app-button-atom')
export class ButtonAtom extends LitElement {
	/** What the button does in a form. Left out, the browser's own default applies. */
	@property() type?: 'button' | 'submit' | 'reset'

	static override styles = [
		baseStyles,
		css`
			:host {
				display: inline-block;
			}

			button {
				cursor: pointer;
				border: 2px solid var(--globalColor_teal900);
				border-radius: 0.5rem;
				background-color: var(--globalColor_teal200);
				padding: 0.25rem 1rem;
			}

			button:hover,
			button:focus {
				background-color: var(--globalColor_teal100);
			}
		`,
	]

	override render() {
		return html`<button type=${ifDefined(this.type)} class="ButtonAtom">
			<slot></slot>
		</button>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-button-atom': ButtonAtom
	}
}
