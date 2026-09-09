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
import { PageFailureCatcher } from './lib/PageFailureBoundary'
import './app.css'

/**
 * The site as the build draws it.
 *
 * Deliberately without the failure catcher: a request that fails while the
 * pages are being written should stop the build and name the meal database,
 * rather than writing out a page that says the meals could not be loaded.
 */
export function App() {
	return (
		<LocationProvider>
			<SiteRoutes />
		</LocationProvider>
	)
}

/**
 * The site as the browser draws it — the same thing, plus the failure page.
 *
 * Here a failed request must not take the whole site down to nothing, which is
 * what happens without a catcher. It sits inside the location provider so the
 * failure page's own links still move around the site. It draws nothing of its
 * own, so what reaches the page is the same as what the build wrote and the
 * two still line up when the browser takes over.
 */
function AppInBrowser() {
	return (
		<LocationProvider>
			<PageFailureCatcher>
				<SiteRoutes />
			</PageFailureCatcher>
		</LocationProvider>
	)
}

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
 *
 * It catches only a *paused* page, not a failed one. preact-iso builds its
 * `componentDidCatch` from an `onError` prop, and preact treats a component as
 * an error boundary only when it has that method — so with no `onError` a
 * failed request walks straight past this. `PageFailureCatcher` is what catches
 * that, and only in the browser.
 */
function SiteRoutes() {
	return (
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
	)
}

const appRoot =
	typeof window === 'undefined' ? null : document.getElementById('app')
if (appRoot) {
	hydrate(<AppInBrowser />, appRoot)
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
 * deliberately: the categories page links to every category, and each of those
 * links to every meal in it, so following them all would ask the meal database
 * for one meal at a time until it had fetched the lot — measured at roughly
 * 800 by counting the meal links across the written-out category pages, and
 * growing as the database does. A meal page fetches its own meal when opened
 * instead, and `public/_redirects` tells a static host to serve the site for an
 * address with no file behind it.
 *
 * @param address - a link found in a page the build has just written
 */
function checkShouldBuildPageAhead(address: string): boolean {
	return !address.startsWith('/meal/')
}
