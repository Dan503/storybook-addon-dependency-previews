import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { baseStyles } from '../../lib/baseStyles'
import '../03-organisms/SiteFrameOrganism.lit'
import '../01-atoms/ScreenPaddingAtom.lit'
import '../listings/card/CardListingOrganism.lit'
import type { PropsForCardMolecule } from '../listings/card/CardMolecule.lit'

/** A page that is a titled list of cards, such as the categories or the meals in one. */
@customElement('app-card-list-template')
export class CardListTemplate extends LitElement {
	/**
	 * The page's heading. Not called `title`, which every element already has
	 * and which shows as a tooltip.
	 */
	@property() pageTitle = ''
	/** A line of text under the heading. */
	@property() introText?: string
	/** The cards to list. */
	@property({ attribute: false }) cardList: Array<PropsForCardMolecule> = []

	static override styles = [
		baseStyles,
		css`
			:host {
				display: grid;
			}

			.CardListTemplate {
				display: grid;
				gap: 1rem;
			}

			h1 {
				font-size: 2.25rem;
				line-height: calc(2.5 / 2.25);
				font-weight: 700;
			}

			p {
				margin-bottom: 0.5rem;
			}
		`,
	]

	override render() {
		return html`<app-site-frame-organism>
			<app-screen-padding-atom padVertical>
				<div class="CardListTemplate">
					<h1>${this.pageTitle}</h1>
					<p>${this.introText}</p>
					<app-card-listing-organism
						.cards=${this.cardList}
					></app-card-listing-organism>
				</div>
			</app-screen-padding-atom>
		</app-site-frame-organism>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-card-list-template': CardListTemplate
	}
}
