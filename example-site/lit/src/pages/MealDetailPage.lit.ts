import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { fetchMealById } from 'example-site-shared/utils'
import { getFetchedData } from '../lib/fetchedData'
import { gridHostStyles } from '../lib/gridHostStyles'
import { getTextFromAddressPiece } from '../lib/addressPiece'
import { setPageTitle } from '../lib/pageTitle'
import '../components/04-templates/DetailPageTemplate.lit'
import './LoadFailurePage.lit'
import './NotFoundPage.lit'

/** One meal's page. A meal id the meal database does not know draws the not-found page. */
@customElement('app-meal-detail-page')
export class MealDetailPage extends LitElement {
	/** The meal's id as it appears in the address, still escaped. */
	@property() mealIdInAddress?: string

	static override styles = gridHostStyles

	override render() {
		const mealId = getTextFromAddressPiece(this.mealIdInAddress)
		if (!mealId) return html`<app-not-found-page></app-not-found-page>`

		const meal = getFetchedData({
			key: `meal:${mealId}`,
			load: () => fetchMealById(mealId),
			page: this,
		})
		if (meal.status === 'failed') {
			return html`<app-load-failure-page
				.onTryAgain=${meal.tryAgain}
			></app-load-failure-page>`
		}
		if (meal.status === 'waiting') {
			// The meal's name is not known yet, so the tab gets a stand-in rather
			// than keeping the title of whatever page came before.
			setPageTitle('Meal | The Meal Place')
			return html`<app-detail-page-template
				isLoading
			></app-detail-page-template>`
		}
		if (!meal.data) return html`<app-not-found-page></app-not-found-page>`

		setPageTitle(`${meal.data.name} | The Meal Place`)
		return html`<app-detail-page-template
			.meal=${meal.data}
		></app-detail-page-template>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-meal-detail-page': MealDetailPage
	}
}
