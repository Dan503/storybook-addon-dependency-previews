import {
	generatePaths,
	type ColonRouteAddress,
} from 'example-site-shared/utils'

/**
 * Every address the site has, as vue-router matches them.
 *
 * This is the one place in the site that stays on the `:name` spelling — it is
 * vue-router's own syntax and cannot be anything else, while the site's links
 * are written the way Nuxt names its pages.
 *
 * Generated from the shared list rather than written out, so it cannot fall
 * behind it. Listing the addresses one by one, rather than catching them with a
 * catch-all, is what makes a story pointing somewhere the site does not have
 * still show up as unmatched.
 *
 * Annotated rather than left to inference, so the marks below are checked
 * against the spelling this file is for. Without it, asking for any other
 * spelling is accepted here and only shows up as stories failing to match.
 *
 * It lives in its own file so `pnpm typecheck` can read it. Its neighbour
 * `preview.ts` imports the dependency graph that `sb-deps` generates, which is
 * not in the repository, so a type check taking in the whole folder would fail
 * on a fresh clone before anyone had run Storybook once.
 */
export const routePatterns: Array<ColonRouteAddress> = generatePaths({
	before: ':',
	after: '',
})
