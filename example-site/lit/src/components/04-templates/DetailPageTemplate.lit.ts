import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { Meal } from 'example-site-shared/utils'
import { baseStyles } from '../../lib/baseStyles'
import '../03-organisms/SiteFrameOrganism.lit'
import '../01-atoms/ScreenPaddingAtom.lit'
import '../01-atoms/ButtonAtom.lit'
import '../listings/compact/CompactListingOrganism.lit'
import type { PropsForCompactListingMolecule } from '../listings/compact/CompactListingMolecule.lit'

/** One meal's page: its picture, its recipe, and what goes into it. */
@customElement('app-detail-page-template')
export class DetailPageTemplate extends LitElement {
	/** The meal to show. Left empty once loading has finished, the page says it was not found. */
	@property({ attribute: false }) meal?: Meal | null
	/** Show that the meal is still on its way, rather than the meal. */
	@property({ type: Boolean }) isLoading = false

	static override styles = [
		baseStyles,
		css`
			:host {
				display: grid;
			}

			.notFound {
				margin-bottom: 1rem;
			}

			h1 {
				margin-bottom: 1.25rem;
				font-size: 1.875rem;
				line-height: calc(2.25 / 1.875);
				font-weight: 700;
			}

			h2 {
				font-size: 1.5rem;
				line-height: calc(2 / 1.5);
				font-weight: 700;
			}

			.columns,
			.pictureAndRecipe {
				display: grid;
				gap: 1rem;
			}

			.ingredients {
				display: grid;
				grid-template-rows: auto 1fr;
				align-items: start;
				gap: 1rem;
			}

			.picture {
				margin-top: 0.5rem;
			}

			.recipe {
				white-space: pre-wrap;
			}

			@media (min-width: 40rem) {
				.pictureAndRecipe {
					grid-template-columns: 1fr 2fr;
				}
			}

			@media (min-width: 64rem) {
				.columns {
					grid-template-columns: 2fr 30rem;
				}
			}
		`,
	]

	override render() {
		return html`<app-site-frame-organism>
			<app-screen-padding-atom padVertical>
				${this._renderPageContent()}
			</app-screen-padding-atom>
		</app-site-frame-organism>`
	}

	/** Draws whichever of the three states the page is in: loading, not found, or the meal. */
	private _renderPageContent() {
		if (this.isLoading) return html`<p>Loading...</p>`
		if (!this.meal) {
			return html`<p class="notFound">Meal not found.</p>
				<app-button-atom @click=${() => history.back()}
					>Go back</app-button-atom
				>`
		}
		const ingredientItems: Array<PropsForCompactListingMolecule> =
			this.meal.ingredients.map((ingredient) => ({
				title: ingredient.ingredient,
				description: ingredient.amount,
				imageSrc: ingredient.imageUrl.small,
			}))
		return html`<h1>${this.meal.name}</h1>
			<div class="columns">
				<div class="pictureAndRecipe">
					<img src=${this.meal.image} alt=${this.meal.name} class="picture" />
					<div>
						<h2>Recipe</h2>
						<p class="recipe">${this.meal.instructions}</p>
					</div>
				</div>
				<div class="ingredients">
					<div>
						<h2>Ingredients</h2>
						<app-compact-listing-organism
							.items=${ingredientItems}
						></app-compact-listing-organism>
					</div>
				</div>
			</div>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-detail-page-template': DetailPageTemplate
	}
}
