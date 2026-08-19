/// <reference types="vite/client" />

import { setup } from '@storybook/vue3-vite'
import { createMemoryHistory, createRouter, RouterLink } from 'vue-router'
import {
	defaultPreviewParameters,
	dependencyPreviewDecorators,
	type StorybookPreviewConfig,
} from 'storybook-addon-dependency-previews'
import type { RoutePattern } from 'example-site-shared/utils'

import '../app/assets/css/main.css'
import dependenciesJson from './dependency-previews.json'

const blankRouteComponent = { template: '<div />' }

// Every address the site has, as vue-router matches them. This is the one place
// that stays on the `:name` spelling — it is vue-router's own syntax and cannot
// be anything else, while the site's links are written the way Nuxt names its
// pages.
//
// A record rather than a list, so the type check insists on all of them. A list
// would only check that each entry is one of the shared addresses, which leaves
// this free to fall behind the moment the shared list gains one. Each value is
// `true` only because a key needs one; the keys are the point.
//
// Written out one by one rather than caught by a catch-all, so a story pointing
// somewhere the site does not have still shows up as unmatched.
const everyRoutePattern: Record<RoutePattern, true> = {
	'/': true,
	'/categories': true,
	'/categories/:category': true,
	'/meal/:mealId': true,
	'/contact': true,
}

const router = createRouter({
	history: createMemoryHistory(),
	routes: Object.keys(everyRoutePattern).map((path) => ({
		path,
		component: blankRouteComponent,
	})),
})

setup((app) => {
	// Storybook reuses the app instance across re-renders (HMR, arg/control
	// changes, viewport resizes, revisiting stories). vue-router's install
	// defines non-configurable `$route`/`$router` globalProperties, so
	// re-running `app.use(router)` on an already-configured app throws
	// `TypeError: Cannot redefine property: $route`. Re-registering the
	// `NuxtLink` component would likewise warn. Guard on the router-installed
	// marker so this only runs once per app instance (new apps still get it).
	if (app.config.globalProperties.$router) return

	app.use(router)
	app.component('NuxtLink', RouterLink)
})

const previewConfig: StorybookPreviewConfig = {
	// Essential configuration for storybook-addon-dependency-previews
	parameters: {
		...defaultPreviewParameters,
		dependencyPreviews: {
			dependenciesJson,
			projectRootPath: new URL('..', import.meta.url).pathname,
			storyModules: import.meta.glob('/components/**/*.stories.{ts,tsx}', {
				eager: false,
			}),
			sourceRootUrl:
				'https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/example-site/vue',
		},
	},
	decorators: [...dependencyPreviewDecorators],
}

export default previewConfig
