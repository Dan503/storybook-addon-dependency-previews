/// <reference types="vite/client" />

import {
	defaultPreviewParameters,
	dependencyPreviewDecorators,
} from 'storybook-addon-dependency-previews'

import { LocationProvider } from 'preact-iso'

import dependenciesJson from './dependency-previews.json'

import '../src/app.css'

import type { Preview } from '@storybook/preact-vite'

const preview: Preview = {
	decorators: [
		...dependencyPreviewDecorators,
		// The nav asks the router which page is on screen so it can mark the
		// current one, and there is no router in a story without this. Not
		// needed by the addon itself.
		(Story) => (
			<LocationProvider>
				<Story />
			</LocationProvider>
		),
	],
	parameters: {
		...defaultPreviewParameters,
		dependencyPreviews: {
			dependenciesJson,
			projectRootPath: new URL('..', import.meta.url).pathname,
			storyModules: import.meta.glob(
				'/src/**/*.{story,stories}.{tsx,ts,jsx,js,svelte}',
				{ eager: false },
			),
			sourceRootUrl:
				'https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/example-site/preact',
		},
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
}

export default preview
