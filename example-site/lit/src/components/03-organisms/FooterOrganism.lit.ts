import { LitElement, css, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { baseStyles } from '../../lib/baseStyles'
import '../01-atoms/ExternalLinkAtom.lit'

/** The strip along the bottom of every page, crediting where the meals come from. */
@customElement('app-footer-organism')
export class FooterOrganism extends LitElement {
	static override styles = [
		baseStyles,
		css`
			:host {
				display: block;
			}

			.FooterOrganism {
				border-top: 2px solid var(--globalColor_teal900);
				background-color: var(--globalColor_teal100);
				padding: 1rem;
				text-align: center;
				color: black;
			}
		`,
	]

	override render() {
		return html`<div class="FooterOrganism">
			<p>
				Meal data provided by
				<app-external-link-atom href="https://www.themealdb.com/"
					>TheMealDB.com</app-external-link-atom
				>
			</p>
		</div>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-footer-organism': FooterOrganism
	}
}
