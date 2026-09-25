import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { baseStyles } from '../../lib/baseStyles'

/**
 * The site's button.
 *
 * Always a plain `type="button"`: the button sits inside the component's
 * shadow root, where it cannot submit or reset a form outside it, so offering
 * those types would promise something it cannot do.
 *
 * @slot - the button's label
 */
@customElement('app-button-atom')
export class ButtonAtom extends LitElement {
	/** Runs when the button is clicked. */
	@property({ attribute: false }) onClick?: (event: MouseEvent) => void

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
		return html`<button type="button" class="ButtonAtom" @click=${this.onClick}>
			<slot></slot>
		</button>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-button-atom': ButtonAtom
	}
}
