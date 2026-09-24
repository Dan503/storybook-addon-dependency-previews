import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import {
	getFullAddressViaColons,
	type ColonRouteTemplate,
	type HrefParams,
	type LinkAddressPropsViaColons,
	type Meal,
} from 'example-site-shared/utils'
import { baseStyles } from '../../../lib/baseStyles'

export interface PropsForCardMolecule extends LinkAddressPropsViaColons {
	title: string
	imgSrc: string
	description: string
}

/**
 * Builds the card for one meal.
 *
 * Both lists that show meals — the featured ones on the home page and the ones
 * in a category — draw the same card from the same fields, so they share this
 * rather than each writing it out.
 *
 * @param meal - the meal the card stands for
 */
export function getMealCard(meal: Meal): PropsForCardMolecule {
	return {
		title: meal.name,
		description: meal.area,
		imgSrc: meal.image,
		href: '/meal/:mealId',
		hrefParams: { mealId: meal.id },
	}
}

/**
 * A card linking to one page: a picture beside a title and a short description,
 * with the picture moving above the words when the card is narrow.
 */
@customElement('app-card-molecule')
export class CardMolecule extends LitElement {
	/**
	 * The card's heading.
	 *
	 * Named `title` to match the card data every site shares, which means it
	 * stands in for the browser's own `title` — the one that shows a tooltip.
	 * Set it as a property, as every use here does: written as an attribute it
	 * would bring the tooltip back as well.
	 */
	@property() override title = ''
	/** The picture on the card. */
	@property() imgSrc = ''
	/** The words under the heading, cut off after four lines. */
	@property() description = ''
	/** The page the card links to, with `:name` marking each piece that changes. */
	@property() href: ColonRouteTemplate = '/'
	/** The pieces that complete `href`, by name. */
	@property({ attribute: false }) hrefParams?: HrefParams

	static override styles = [
		baseStyles,
		css`
			:host {
				display: block;
			}

			.CardMolecule {
				display: grid;
				container-type: inline-size;
			}

			a {
				display: flex;
				height: 100%;
				gap: 0.5rem;
				overflow: hidden;
				border-width: 1px;
				border-radius: 1rem;
				background-color: white;
				transition-property: all;
				transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
				transition-duration: 150ms;
			}

			a:hover {
				transform: scale(1.02);
				background-color: var(--globalColor_teal200);
				box-shadow:
					0 10px 15px -3px rgb(0 0 0 / 0.1),
					0 4px 6px -4px rgb(0 0 0 / 0.1);
			}

			a:focus {
				background-color: var(--globalColor_teal200);
			}

			img {
				aspect-ratio: 16 / 9;
				object-fit: cover;
			}

			.words {
				width: 100%;
				padding: 1rem;
			}

			h3 {
				font-size: 1.25rem;
				line-height: calc(1.75 / 1.25);
				font-weight: 700;
			}

			p {
				overflow: hidden;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 4;
			}

			@container (400px <= width) {
				img {
					width: 200px;
					aspect-ratio: 1 / 1;
				}
			}

			@container (width < 400px) {
				a {
					flex-direction: column;
				}

				img {
					width: 100%;
					aspect-ratio: 16 / 9;
				}
			}
		`,
	]

	override render() {
		const fullAddress = getFullAddressViaColons({
			href: this.href,
			hrefParams: this.hrefParams,
		})
		return html`<div class="CardMolecule">
			<a href=${fullAddress}>
				<img src=${this.imgSrc} alt="" />
				<div class="words">
					<h3>${this.title}</h3>
					<p>${this.description}</p>
				</div>
			</a>
		</div>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-card-molecule': CardMolecule
	}
}
