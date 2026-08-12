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
	// Escaping happens here so that no call site can forget it.
	getCategoryPath: (categoryName) =>
		`/categories/${encodeURIComponent(categoryName)}`,
	getMealPath: (mealId) => `/meal/${mealId}`,
} satisfies RoutePathBuilders
