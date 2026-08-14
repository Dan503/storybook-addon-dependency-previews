/// <reference types="vite/client" />

import { setup } from '@storybook/vue3-vite'
import { createMemoryHistory, createRouter, RouterLink } from 'vue-router'
import {
	defaultPreviewParameters,
	dependencyPreviewDecorators,
	type StorybookPreviewConfig,
} from 'storybook-addon-dependency-previews'

import '../app/assets/css/main.css'
import dependenciesJson from './dependency-previews.json'

const blankRouteComponent = { template: '<div />' }

const router = createRouter({
	history: createMemoryHistory(),
	// Keep this list in step with `RouteAddress` in `example-site-shared/utils`,
	// which is what the site's own links are checked against. Nothing enforces
	// the pairing, so an address added there needs adding to this list too.
	// Written out rather than caught by a catch-all, so a story pointing
	// somewhere the site does not have still shows up as unmatched.
	routes: [
		{ path: '/', component: blankRouteComponent },
		{ path: '/categories', component: blankRouteComponent },
		{ path: '/categories/:category', component: blankRouteComponent },
		{ path: '/meal/:mealId', component: blankRouteComponent },
		{ path: '/contact', component: blankRouteComponent },
	],
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
