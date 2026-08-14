/**
 * Every address the site has.
 *
 * Solid Start generates nothing equivalent to the React site's generated
 * address list, so this file has to be kept in step with the files under
 * `src/routes/` by hand — add a page there, add its address here.
 */
export type RoutePath =
	| '/'
	| '/categories'
	| `/categories/${string}`
	| `/meal/${string}`
	| '/contact'

interface RoutePathBuilders {
	home: RoutePath
	categories: RoutePath
	contact: RoutePath
	getCategoryPath: (categoryName: string) => RoutePath
	getMealPath: (mealId: string) => RoutePath
}

export const routePaths = {
	home: '/',
	categories: '/categories',
	contact: '/contact',
	// Category names are free text, so they are escaped here rather than at
	// each call site. Meal ids are numbers from the meal database, and the page
	// that reads one does not unescape it, so escaping it here would break the
	// pair — leave it as it is unless that page changes to match.
	getCategoryPath: (categoryName) =>
		`/categories/${encodeURIComponent(categoryName)}`,
	getMealPath: (mealId) => `/meal/${mealId}`,
} satisfies RoutePathBuilders
