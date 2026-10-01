import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { fetchCategories, type Category } from 'example-site-shared/utils'
import { getFetchedData } from '../lib/fetchedData'
import { gridHostStyles } from '../lib/gridHostStyles'
import { setPageTitle } from '../lib/pageTitle'
import type { PropsForCardMolecule } from '../components/listings/card/CardMolecule.lit'
import '../components/04-templates/CardListTemplate.lit'
import './LoadFailurePage.lit'

/** Every food category, each card leading to the meals in it. */
@customElement('app-categories-page')
export class CategoriesPage extends LitElement {
	static override styles = gridHostStyles

	override render() {
		setPageTitle('Meal Categories | The Meal Place')
		const categories = getFetchedData({
			key: 'categories',
			load: fetchCategories,
			page: this,
		})
		if (categories.status === 'failed') {
			return html`<app-load-failure-page
				.onTryAgain=${categories.tryAgain}
			></app-load-failure-page>`
		}
		const cardList =
			categories.status === 'ready' ? categories.data.map(getCategoryCard) : []
		return html`<app-card-list-template
			.pageTitle=${'Food Categories'}
			.introText=${'Explore what delicious types of food await you!'}
			.cardList=${cardList}
			?isLoading=${categories.status === 'waiting'}
		></app-card-list-template>`
	}
}

/**
 * Builds the card for one category.
 *
 * @param category - the category the card stands for
 */
function getCategoryCard(category: Category): PropsForCardMolecule {
	return {
		title: category.strCategory,
		description: category.strCategoryDescription,
		imgSrc: category.strCategoryThumb,
		href: '/categories/:category',
		hrefParams: { category: category.strCategory },
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-categories-page': CategoriesPage
	}
}
