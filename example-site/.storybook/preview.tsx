/// <reference types="vite/client" />

import * as React from 'react'
import {
	defaultPreviewParameters,
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
	// Added Tanstack React Router decorator to provide routing context, not needed for the addon itself
	decorators: [
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
	parameters: {
		...defaultPreviewParameters,
		layout: 'centered',
		dependencyPreviews: {
			dependenciesJson,
			storyModules: import.meta.glob(
				'/src/**/*.stories.@(tsx|ts|jsx|js|svelte)',
				{ eager: false },
			),
			sourceBaseUrl:
				'https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/example-site',
		},
	},
}

export default previewConfig
