import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { baseStyles } from '../../../lib/baseStyles'

/** One error message, in bold red. */
@customElement('app-error-message-atom')
export class ErrorMessageAtom extends LitElement {
	/** The message, as plain words or as an `Error` whose message is shown. */
	@property({ attribute: false }) error: string | Error = ''

	static override styles = [
		baseStyles,
		css`
			:host {
				display: block;
			}

			p {
				line-height: 1;
				font-weight: 700;
				color: var(--globalColor_red900);
			}
		`,
	]

	override render() {
		const message =
			typeof this.error === 'string' ? this.error : this.error.message
		return html`<p class="ErrorMessageAtom">${message}</p>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-error-message-atom': ErrorMessageAtom
	}
}
