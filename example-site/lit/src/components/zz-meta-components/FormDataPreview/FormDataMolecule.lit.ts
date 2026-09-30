import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import './FormDataPreviewAtom.lit'

/**
 * A form, or a piece of one, with its values written out underneath, so a
 * story shows what the form holds as it is filled in.
 *
 * @slot - the form or field being previewed
 */
@customElement('app-form-data-molecule')
export class FormDataMolecule extends LitElement {
	/** The values to show, by field name. */
	@property({ attribute: false }) values: Record<string, unknown> = {}

	static override styles = css`
		:host {
			display: grid;
			grid-template-columns: minmax(0, 1fr);
			/* app.css makes the node a story is drawn into a full-height grid,
			   which stretches this element to the height of the frame. Without
			   this the spare height would be shared between the rows, pushing
			   the preview away from the form. */
			align-content: start;
			gap: 0.5rem;
		}
	`

	override render() {
		return html`<slot></slot>
			<app-form-data-preview-atom
				.values=${this.values}
			></app-form-data-preview-atom>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-form-data-molecule': FormDataMolecule
	}
}
