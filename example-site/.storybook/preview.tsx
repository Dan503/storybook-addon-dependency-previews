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

import '../src/styles.css'

const previewConfig: StorybookPreviewConfig = {
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
			sourceBaseUrl:
				'https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/example-site',
		},
	},
}

export default previewConfig
