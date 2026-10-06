import { LitElement, css, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import {
	getFullAddressViaColons,
	type ColonRouteTemplate,
} from 'example-site-shared/utils'
import { baseStyles } from '../../lib/baseStyles'
import { listenForAddressChange } from '../../lib/addressChange'

/**
 * The links to the site's main sections, with the one being read underlined
 * and marked as current for screen readers.
 *
 * A page underneath a section counts as that section, so a single category's
 * page underlines "Food categories". A meal page underlines nothing, since no
 * link leads to the meals as a whole. In Storybook the address belongs to
 * Storybook rather than the site, so nothing is underlined there.
 */
@customElement('app-main-nav-molecule')
export class MainNavMolecule extends LitElement {
	private _stopListeningForAddressChange?: () => void

	override connectedCallback() {
		super.connectedCallback()
		this._stopListeningForAddressChange = listenForAddressChange(() =>
			this.requestUpdate(),
		)
	}

	override disconnectedCallback() {
		super.disconnectedCallback()
		this._stopListeningForAddressChange?.()
	}

	static override styles = [
		baseStyles,
		css`
			:host {
				display: block;
			}

			nav {
				display: flex;
				gap: 1rem;
				font-weight: 700;
			}

			a[aria-current='true'] {
				text-decoration-line: underline;
			}
		`,
	]

	override render() {
		return html`<nav class="MainNavMolecule">
			${this._renderLink('/', 'Home')}
			${this._renderLink('/categories', 'Food categories')}
			${this._renderLink('/contact', 'Contact us')}
		</nav>`
	}

	/**
	 * Draws one link, marked current when it leads to the section being read.
	 *
	 * @param href - the section's address
	 * @param label - the link's text
	 */
	private _renderLink(href: ColonRouteTemplate, label: string) {
		const fullAddress = getFullAddressViaColons({ href })
		const isCurrent = checkIsCurrentPage(location.pathname, fullAddress)
		// `true` rather than `page`, since the link can stand for a section the
		// page sits underneath rather than for the page itself.
		const ariaCurrent = isCurrent ? 'true' : 'false'
		return html`<a href=${fullAddress} aria-current=${ariaCurrent}>${label}</a>`
	}
}

/**
 * Whether the page on screen is this link's page, or one sitting underneath it.
 *
 * "Underneath" is why the test is not a plain match: `/categories` should stay
 * marked while a single category is being read. It is written as the address
 * plus a slash rather than as a plain starts-with, so that `/` — which every
 * address begins with — marks only the home page, and so that a future
 * `/categories-archive` would not mark `/categories`.
 *
 * @param path - the address on screen
 * @param fullAddress - where the link points
 */
function checkIsCurrentPage(path: string, fullAddress: string): boolean {
	const isSamePage = path === fullAddress
	const isPageUnderneath = path.startsWith(`${fullAddress}/`)
	return isSamePage || isPageUnderneath
}

declare global {
	interface HTMLElementTagNameMap {
		'app-main-nav-molecule': MainNavMolecule
	}
}
