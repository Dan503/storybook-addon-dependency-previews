/// <reference types="vite/client" />

import {
	defaultPreviewParameters,
	dependencyPreviewDecorators,
	type StorybookPreviewConfig,
} from 'storybook-addon-dependency-previews'
import {
	RouterProvider,
	createMemoryHistory,
	createRootRoute,
	createRouter,
} from '@tanstack/react-router'

import dependenciesJson from './dependency-previews.json'

import '../src/styles.css'

const previewConfig: StorybookPreviewConfig = {
	// Essential configuration for storybook-addon-dependency-previews
	parameters: {
		...defaultPreviewParameters,
		dependencyPreviews: {
			dependenciesJson,
			projectRootPath: new URL('..', import.meta.url).pathname,
			storyModules: import.meta.glob(
				'/src/**/*.stories.@(tsx|ts|jsx|js|svelte)',
				{ eager: false },
			),
			sourceRootUrl:
				'https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/example-site/react',
		},
	},
	// Added Tanstack React Router decorator to provide routing context, not needed for the addon itself
	decorators: [
		...dependencyPreviewDecorators,
		(Story) => (
			<RouterProvider
				router={createRouter({
					history: createMemoryHistory(),
					routeTree: createRootRoute({
						component: Story,
					}),
				})}
			/>
		),
	],
}

export default previewConfig
