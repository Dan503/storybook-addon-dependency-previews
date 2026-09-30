import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { baseStyles } from '../../../lib/baseStyles'

/** A form's values written out as text, to show what it holds. */
@customElement('app-form-data-preview-atom')
export class FormDataPreviewAtom extends LitElement {
	/** The values to show, by field name. */
	@property({ attribute: false }) values: Record<string, unknown> = {}

	static override styles = [
		baseStyles,
		css`
			:host {
				display: block;
			}

			pre {
				overflow: auto;
			}
		`,
	]

	override render() {
		const indentSpaces = 3
		const valuesText = JSON.stringify(this.values, null, indentSpaces)
		return html`<pre
			class="FormDataPreviewAtom"
		><code>${valuesText}</code></pre>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-form-data-preview-atom': FormDataPreviewAtom
	}
}
