import * as React from 'react'
import { ProjectAnnotations, Renderer } from '@storybook/types'
import { defaultPreviewParameters } from 'storybook-addon-dependency-previews'
import {
	RouterProvider,
	createMemoryHistory,
	createRootRoute,
	createRouter,
} from '@tanstack/react-router'

import '../src/styles.css'

const previewConfig: ProjectAnnotations<Renderer> = {
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
		dependencyPreviews: {
			sourceBaseUrl:
				'https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/example-site',
		},
	},
}

export default previewConfig
