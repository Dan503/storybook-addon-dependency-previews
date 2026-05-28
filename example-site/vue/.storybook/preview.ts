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
	routes: [
		{ path: '/', component: blankRouteComponent },
		{ path: '/categories', component: blankRouteComponent },
		{ path: '/contact', component: blankRouteComponent },
	],
})

setup((app) => {
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
