import { LitElement, css, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { baseStyles } from '../../lib/baseStyles'

/**
 * A stand-in for whatever a wrapping component is given, so its story has
 * something to show.
 */
@customElement('app-child-content-atom')
export class ChildContentAtom extends LitElement {
	static override styles = [
		baseStyles,
		css`
			:host {
				display: grid;
				box-sizing: border-box;
				min-height: 15rem;
				place-items: center;
				border: 2px dashed black;
				border-radius: 0.375rem;
				background-color: var(--globalColor_gray200);
				padding: 1rem;
				color: black;
			}
		`,
	]

	override render() {
		return html`<p class="ChildContentAtom">Placeholder child content</p>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-child-content-atom': ChildContentAtom
	}
}
