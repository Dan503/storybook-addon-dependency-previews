import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import './ScreenPaddingAtom.lit'

/**
 * Keeps content to a readable width in the middle of the screen, padded in from
 * its edges.
 *
 * @slot - the content to keep narrow
 */
@customElement('app-content-restraint-atom')
export class ContentRestraintAtom extends LitElement {
	/** Pad the top and bottom as well as the sides. */
	@property({ type: Boolean }) padVertical = false

	static override styles = css`
		:host {
			display: block;
		}

		.ContentRestraintAtom {
			display: grid;
			grid-template-columns: 1fr minmax(auto, 800px) 1fr;
		}

		.content {
			grid-column-start: 2;
			height: 100%;
		}
	`

	override render() {
		return html`
			<app-screen-padding-atom .padVertical=${this.padVertical}>
				<div class="ContentRestraintAtom">
					<div class="content"><slot></slot></div>
				</div>
			</app-screen-padding-atom>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-content-restraint-atom': ContentRestraintAtom
	}
}
