import {
	ErrorBoundary,
	LocationProvider,
	Router,
	Route,
	hydrate,
	prerender as ssr,
} from 'preact-iso'

import { HomePage } from './pages/HomePage'
import { CategoriesPage } from './pages/CategoriesPage'
import { CategoryMealsPage } from './pages/CategoryMealsPage'
import { MealDetailPage } from './pages/MealDetailPage'
import { ContactPage } from './pages/ContactPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { getTitleForPageBeingBuilt } from './lib/pageTitle'
import './app.css'

/*
 * The five addresses every example site carries, written the way preact-iso
 * matches them — a colon in front of the piece that changes. They are the same
 * five the shared package lists as `colonRouteTemplates`, which is what
 * `InternalLinkAtom` checks a link against.
 *
 * `ErrorBoundary` is half of what lets a page pause while it waits for its
 * meals. A page waiting throws its unfinished request, and this catches it and
 * keeps what is on screen there in the meantime. The other half is the page
 * asking for its own redraw, which `useDataOrWait` does. Both were checked by
 * taking each away in turn: without either one the page stays blank for good.
 */
export function App() {
	return (
		<LocationProvider>
			<ErrorBoundary>
				<Router>
					<Route path="/" component={HomePage} />
					<Route path="/categories" component={CategoriesPage} />
					<Route path="/categories/:category" component={CategoryMealsPage} />
					<Route path="/meal/:mealId" component={MealDetailPage} />
					<Route path="/contact" component={ContactPage} />
					<Route default component={NotFoundPage} />
				</Router>
			</ErrorBoundary>
		</LocationProvider>
	)
}

const appRoot =
	typeof window === 'undefined' ? null : document.getElementById('app')
if (appRoot) {
	hydrate(<App />, appRoot)
}

/**
 * Draws one page for the build, and says which pages to write next.
 *
 * The build finds the pages it has not written yet by reading the links in the
 * ones it has, so the list handed back here is what decides how far it goes.
 *
 * The address is not passed in: the build sets it on the global `location`
 * before calling this, which is where preact-iso's location provider reads it
 * from.
 */
export async function prerender() {
	const page = await ssr(<App />)
	const linksFound = page.links ?? new Set<string>()
	return {
		...page,
		head: { title: getTitleForPageBeingBuilt() },
		links: new Set([...linksFound].filter(checkShouldBuildPageAhead)),
	}
}

/**
 * Whether the build should write this page out ahead of anyone asking for it.
 *
 * Every page but a single meal's is written ahead. Meal pages are left out
 * deliberately: the home page links to featured meals, the categories page
 * links to all fourteen categories, and each of those links to every meal in
 * it, so following them all would ask the meal database for around three
 * hundred meals, one after another, on every build. A meal page fetches its own
 * meal when opened instead, and `public/_redirects` tells a static host to
 * serve the site for an address with no file behind it.
 *
 * @param address - a link found in a page the build has just written
 */
function checkShouldBuildPageAhead(address: string): boolean {
	return !address.startsWith('/meal/')
}
