import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import { baseStyles } from '../../../lib/baseStyles'
import './CompactListingMolecule.lit'
import type { PropsForCompactListingMolecule } from './CompactListingMolecule.lit'

/** A grid of small items, as many to a row as fit. */
@customElement('app-compact-listing-organism')
export class CompactListingOrganism extends LitElement {
	/** The items to show, in order. Each title must be different, since items are told apart by it. */
	@property({ attribute: false }) items: Array<PropsForCompactListingMolecule> =
		[]

	static override styles = [
		baseStyles,
		css`
			:host {
				display: block;
			}

			.CompactListingOrganism {
				display: grid;
				grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
				gap: 1rem;
			}
		`,
	]

	override render() {
		return html`<ul class="CompactListingOrganism">
			${repeat(
				this.items,
				(item) => item.title,
				(item) =>
					html`<li>
						<app-compact-listing-molecule
							.imageSrc=${item.imageSrc}
							.title=${item.title}
							.description=${item.description}
							.href=${item.href}
							.hrefParams=${item.hrefParams}
						></app-compact-listing-molecule>
					</li>`,
			)}
		</ul>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-compact-listing-organism': CompactListingOrganism
	}
}
