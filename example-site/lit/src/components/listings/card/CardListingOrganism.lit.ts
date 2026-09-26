import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import './CardMolecule.lit'
import type { PropsForCardMolecule } from './CardMolecule.lit'

/**
 * A grid of cards, three to a row, spreading to six on a wide screen and
 * narrowing to as many as fit on a small one.
 */
@customElement('app-card-listing-organism')
export class CardListingOrganism extends LitElement {
	/** The cards to show, in order. */
	@property({ attribute: false }) cards: Array<PropsForCardMolecule> = []

	static override styles = css`
		:host {
			display: block;
		}

		.container {
			display: grid;
			container-type: inline-size;
		}

		.CardListingOrganism {
			display: grid;
			gap: 1.5rem;
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		@container (width < 800px) {
			.CardListingOrganism {
				grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
			}
		}

		@container (width > 1400px) {
			.CardListingOrganism {
				grid-template-columns: repeat(6, minmax(0, 1fr));
			}
		}
	`

	override render() {
		return html`<div class="container">
			<div class="CardListingOrganism">
				${this.cards.map(
					(card) =>
						html`<app-card-molecule
							.title=${card.title}
							.imgSrc=${card.imgSrc}
							.description=${card.description}
							.href=${card.href}
							.hrefParams=${card.hrefParams}
						></app-card-molecule>`,
				)}
			</div>
		</div>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-card-listing-organism': CardListingOrganism
	}
}
