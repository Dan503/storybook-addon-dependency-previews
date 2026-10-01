import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { getFullAddressViaColons } from 'example-site-shared/utils'
import { setPageTitle } from '../lib/pageTitle'
import { messagePageStyles, renderMessagePage } from './messagePage'

/**
 * Shown for an address the site does not have.
 *
 * An element of its own rather than only the router's fallback, because the
 * meal page and a single category's page draw it too: an id the meal database
 * does not know, or a category name whose escaping is broken, is a page that is
 * not there, the same as a misspelt address.
 */
@customElement('app-not-found-page')
export class NotFoundPage extends LitElement {
	static override styles = messagePageStyles

	override render() {
		setPageTitle('Page not found | The Meal Place')
		const categoriesAddress = getFullAddressViaColons({ href: '/categories' })
		return renderMessagePage(
			html`<h1>We could not find that page</h1>
				<p>
					The address you followed does not lead anywhere on this site. It may
					have been mistyped, or the meal it pointed at may no longer be in the
					meal database.
				</p>
				<a href=${categoriesAddress}>Browse the food categories instead</a>`,
		)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-not-found-page': NotFoundPage
	}
}
