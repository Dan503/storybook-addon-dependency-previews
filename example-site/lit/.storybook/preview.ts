/// <reference types="vite/client" />

import { setCustomElementsManifest } from '@storybook/web-components-vite'
import {
	defaultPreviewParameters,
	dependencyPreviewDecorators,
	type StorybookPreviewConfig,
} from 'storybook-addon-dependency-previews'

import dependenciesJson from './dependency-previews.json'
// Written by `pnpm sb:docs` from the doc comments on each component, so a docs
// page can list a component's properties and slots rather than only what its
// story happens to pass.
import customElements from '../custom-elements.json'

import '../src/app.css'

setCustomElementsManifest(customElements)

const previewConfig: StorybookPreviewConfig = {
	decorators: [...dependencyPreviewDecorators],
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
				'https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/example-site/lit',
		},
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
}

export default previewConfig
