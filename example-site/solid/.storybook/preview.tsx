/// <reference types="vite/client" />

import {
	defaultPreviewParameters,
	dependencyPreviewDecorators,
} from 'storybook-addon-dependency-previews'

import { MemoryRouter, Route } from '@solidjs/router'

import dependenciesJson from './dependency-previews.json'

import '../src/app.css'

import type { Preview } from 'storybook-solidjs-vite'

const preview: Preview = {
	decorators: [
		...dependencyPreviewDecorators,
		// Solid Start's link only works inside a router, so every story is
		// wrapped in one that keeps its address in memory and goes nowhere.
		// Not needed by the addon itself.
		(Story) => (
			<MemoryRouter>
				<Route path="*" component={() => <Story />} />
			</MemoryRouter>
		),
	],
	parameters: {
		...defaultPreviewParameters,
		dependencyPreviews: {
			dependenciesJson,
			projectRootPath: new URL('..', import.meta.url).pathname,
			storyModules: import.meta.glob('/src/**/*.stories.{tsx,ts,jsx,js}', {
				eager: false,
			}),
			sourceRootUrl:
				'https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/example-site/solid',
		},
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},

		a11y: {
			// 'todo' - show a11y violations in the test UI only
			// 'error' - fail CI on a11y violations
			// 'off' - skip a11y checks entirely
			test: 'todo',
		},
	},
}

export default preview
