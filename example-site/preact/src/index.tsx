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
 * The `Router` is what lets a page pause while it waits for its meals: a
 * waiting page throws its unfinished request, the router catches it and holds
 * the previous page on screen until it settles. The other half is the page
 * asking for its own redraw, which `useDataOrWait` does.
 *
 * `ErrorBoundary` earns its place through the import rather than through
 * anything it draws, and it must not be removed. Preact hands *every* throw to
 * one hook, and that hook only knows how to look for an error boundary —
 * telling a thrown request apart from a thrown failure, and handing the first
 * to the router, is done by a replacement hook that preact-iso installs from
 * the same file `ErrorBoundary` comes from. `preact-iso` is published as having
 * no side effects, so once nothing imports that file the build is free to drop
 * it, and it does. Then a waiting page's request reaches `PageFailureBoundary`
 * instead, and every page that pauses for its meals draws the failure page on a
 * perfectly good connection. The home page asks for meals too, but through an
 * effect rather than by pausing, so it is untouched either way.
 *
 * It only shows in a built site, because the dev server does not drop unused
 * modules — so `pnpm dev` looks right either way. This was removed once, on
 * the strength of a dev-server test, and put back after `pnpm preview` showed
 * every category page failing.
 *
 * To check it: grep the whole of `dist/assets/*.js` for `_forwarded`, and no
 * match means the hook is gone. That direction is the reliable one. A match on
 * its own proves less, because preact's React compatibility layer sets the same
 * name — it is not in this bundle today, but pulling it in would satisfy the
 * grep on its own. Cover every file in that folder, too: the prerender chunk
 * finds none by itself, since the marker sits in the shared chunk it imports.
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
 * This takes no argument. The build does hand one over — the address, as `url`
 * and again inside `route` — but it also writes that address onto the global
 * `location` immediately beforehand, and that is where preact-iso's location
 * provider reads it from, so there is nothing to pass on.
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
