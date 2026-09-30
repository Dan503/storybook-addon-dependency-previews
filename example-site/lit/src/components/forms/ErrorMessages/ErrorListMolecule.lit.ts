import { LitElement, css, html, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { baseStyles } from '../../../lib/baseStyles'
import type { FormErrors } from '../FormTypes'
import './ErrorMessageAtom.lit'

/** A bulleted list of error messages, drawing nothing when there are none. */
@customElement('app-error-list-molecule')
export class ErrorListMolecule extends LitElement {
	/** The messages to list. */
	@property({ attribute: false }) errors: FormErrors = null

	static override styles = [
		baseStyles,
		css`
			:host {
				display: block;
			}

			ul {
				display: grid;
				gap: 0.25rem;
				padding-left: 1.5rem;
			}

			li {
				list-style: disc outside;
			}
		`,
	]

	override render() {
		if (!this.errors?.length) {
			return nothing
		}
		return html`<ul class="ErrorListMolecule">
			${this.errors.map(
				(error) =>
					html`<li>
						<app-error-message-atom .error=${error}></app-error-message-atom>
					</li>`,
			)}
		</ul>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-error-list-molecule': ErrorListMolecule
	}
}
