import { LitElement, css, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { fetchRandomMealList } from 'example-site-shared/utils'
import { getFetchedData } from '../lib/fetchedData'
import { setPageTitle } from '../lib/pageTitle'
import '../components/04-templates/HomeTemplate.lit'
import './LoadFailurePage.lit'

const featuredMealCount = 7

/**
 * The front page.
 *
 * Its meals are a random seven, fetched once per visit: coming back to the home
 * page shows the same seven, and a reload picks new ones. While they are on
 * their way the page draws with no meals, which leaves the welcome and the
 * heading in place.
 */
@customElement('app-home-page')
export class HomePage extends LitElement {
	static override styles = css`
		:host {
			display: grid;
		}
	`

	override render() {
		setPageTitle(
			'The Meal Place - The Storybook Dependency Previews Example Site',
		)
		const featuredMeals = getFetchedData({
			key: 'featured-meals',
			load: () => fetchRandomMealList(featuredMealCount),
			page: this,
		})
		if (featuredMeals.status === 'failed') {
			return html`<app-load-failure-page
				.onTryAgain=${featuredMeals.tryAgain}
			></app-load-failure-page>`
		}
		const mealList = featuredMeals.status === 'ready' ? featuredMeals.data : []
		return html`<app-home-template
			.featuredMeals=${mealList}
		></app-home-template>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-home-page': HomePage
	}
}
