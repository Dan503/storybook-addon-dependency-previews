import { LitElement, html, render, type TemplateResult } from 'lit'
import { customElement } from 'lit/decorators.js'
import { Router } from '@lit-labs/router'
import {
	colonRouteTemplates,
	type ColonRouteTemplate,
	type HrefParams,
} from 'example-site-shared/utils'
import { announceAddressChange } from './lib/addressChange'
import { gridHostStyles } from './lib/gridHostStyles'
import './pages/HomePage.lit'
import './pages/CategoriesPage.lit'
import './pages/CategoryMealsPage.lit'
import './pages/MealDetailPage.lit'
import './pages/ContactPage.lit'
import './pages/NotFoundPage.lit'
import './app.css'

// The router matches addresses with the browser's `URLPattern`, which older
// Safari lacks. The package that adds it is fetched only where it is missing,
// and before the site is drawn, since the router first matches the address as
// soon as the site element is on the page.
const isAddressMatchingMissing = !('URLPattern' in globalThis)
if (isAddressMatchingMissing) await import('urlpattern-polyfill')

/**
 * The page that answers each address, keyed by the address as the router
 * matches it — a colon in front of the piece that changes.
 *
 * Typed against the shared list rather than written out beside the routes, so a
 * page missing for one of the shared addresses, or one listed for an address
 * the shared package does not have, fails the type check.
 *
 * A changing piece reaches its page still escaped, and the page unescapes it.
 */
const pageForAddress: Record<
	ColonRouteTemplate,
	(addressPieces: HrefParams) => TemplateResult
> = {
	'/': () => html`<app-home-page></app-home-page>`,
	'/categories': () => html`<app-categories-page></app-categories-page>`,
	'/categories/:category': ({ category }) =>
		html`<app-category-meals-page
			.categoryInAddress=${category}
		></app-category-meals-page>`,
	'/meal/:mealId': ({ mealId }) =>
		html`<app-meal-detail-page
			.mealIdInAddress=${mealId}
		></app-meal-detail-page>`,
	'/contact': () => html`<app-contact-page></app-contact-page>`,
}

/**
 * The whole site: draws the page that matches the address, and moves to
 * another without reloading when a link inside the site is clicked or the
 * browser's back and forward buttons are used.
 *
 * It draws only the page. Each page draws the site frame, the header and
 * footer, itself.
 */
@customElement('app-site')
export class Site extends LitElement {
	/**
	 * One route per shared address, read off the shared list itself — the same
	 * list the nav and the cards check their links against. An address none of
	 * them matches draws the not-found page.
	 */
	private _router = new Router(
		this,
		colonRouteTemplates.map((path) => ({ path, render: pageForAddress[path] })),
		{
			fallback: {
				render: () => html`<app-not-found-page></app-not-found-page>`,
			},
		},
	)

	static override styles = gridHostStyles

	override render() {
		return this._router.outlet()
	}

	/** The router asks for a redraw on every move, so this runs after each one. */
	override updated() {
		announceAddressChange()
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-site': Site
	}
}

const appRoot = document.getElementById('app')
if (appRoot) render(html`<app-site></app-site>`, appRoot)
