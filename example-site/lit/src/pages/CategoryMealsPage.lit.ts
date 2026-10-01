import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { fetchMealsByCategory } from 'example-site-shared/utils'
import { getFetchedData } from '../lib/fetchedData'
import { getTextFromAddressPiece } from '../lib/addressPiece'
import { setPageTitle } from '../lib/pageTitle'
import { getMealCard } from '../components/listings/card/CardMolecule.lit'
import '../components/04-templates/CardListTemplate.lit'
import './LoadFailurePage.lit'
import './NotFoundPage.lit'

/**
 * The meals in one category.
 *
 * Moving straight from one category to another keeps this element on screen
 * and only changes `categoryInAddress`, so everything is read from that each
 * time the page draws.
 */
@customElement('app-category-meals-page')
export class CategoryMealsPage extends LitElement {
	/** The category's name as it appears in the address, still escaped. */
	@property() categoryInAddress?: string

	static override styles = css`
		:host {
			display: grid;
		}
	`

	override render() {
		const categoryName = getTextFromAddressPiece(this.categoryInAddress)
		if (!categoryName) return html`<app-not-found-page></app-not-found-page>`

		setPageTitle(`${categoryName} Meals | The Meal Place`)
		const meals = getFetchedData({
			key: `meals-in-category:${categoryName}`,
			load: () => fetchMealsByCategory(categoryName),
			page: this,
		})
		if (meals.status === 'failed') {
			return html`<app-load-failure-page
				.onTryAgain=${meals.tryAgain}
			></app-load-failure-page>`
		}
		const cardList = meals.status === 'ready' ? meals.data.map(getMealCard) : []
		return html`<app-card-list-template
			.pageTitle=${`${categoryName} meals`}
			.introText=${`Explore the delicious ${categoryName} meals!`}
			.cardList=${cardList}
			?isLoading=${meals.status === 'waiting'}
		></app-card-list-template>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-category-meals-page': CategoryMealsPage
	}
}
