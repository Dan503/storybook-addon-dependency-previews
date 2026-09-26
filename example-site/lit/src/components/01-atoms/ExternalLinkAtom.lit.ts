import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { baseStyles } from '../../lib/baseStyles'
import './icons/ExternalLinkIcon.lit'

/**
 * A link to another site, opening in a new tab, with an icon saying so.
 *
 * @slot - the link's text
 */
@customElement('app-external-link-atom')
export class ExternalLinkAtom extends LitElement {
	/** The address on the other site. */
	@property() href = ''

	static override styles = [
		baseStyles,
		css`
			:host {
				display: inline;
			}

			a {
				display: inline-flex;
				align-items: center;
				gap: 0.25rem;
				color: var(--globalColor_teal700);
				text-decoration-line: underline;
			}

			a:hover {
				color: var(--globalColor_teal900);
				text-decoration-line: none;
			}

			a:focus {
				text-decoration-line: none;
			}
		`,
	]

	override render() {
		return html`<a
			class="ExternalLinkAtom"
			target="_blank"
			rel="noopener noreferrer"
			href=${this.href}
			title="Opens in new tab"
			><slot></slot><app-external-link-icon></app-external-link-icon
		></a>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-external-link-atom': ExternalLinkAtom
	}
}
