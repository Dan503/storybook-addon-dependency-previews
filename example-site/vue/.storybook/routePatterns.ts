import type { RoutePattern } from 'example-site-shared/utils'

/**
 * Every address the site has, as vue-router matches them.
 *
 * This is the one place in the site that stays on the `:name` spelling — it is
 * vue-router's own syntax and cannot be anything else, while the site's links
 * are written the way Nuxt names its pages.
 *
 * A record rather than a list, so the type check insists on all of them. A list
 * would only check that each entry is one of the shared addresses, which leaves
 * this free to fall behind the moment the shared list gains one. Each value is
 * `true` only because a key needs one; the keys are the point.
 *
 * It lives in its own file so `pnpm typecheck` can read it. Its neighbour
 * `preview.ts` imports the dependency graph that `sb-deps` generates, which is
 * not in the repository, so a type check taking in the whole folder would fail
 * on a fresh clone before anyone had run Storybook once.
 */
const everyRoutePattern: Record<RoutePattern, true> = {
	'/': true,
	'/categories': true,
	'/categories/:category': true,
	'/meal/:mealId': true,
	'/contact': true,
}

/**
 * The same addresses as a list, for handing to vue-router.
 *
 * Written out one by one rather than caught by a catch-all, so a story pointing
 * somewhere the site does not have still shows up as unmatched.
 */
export const routePatterns = Object.keys(everyRoutePattern)
