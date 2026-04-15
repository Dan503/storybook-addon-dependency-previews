import type { Preview } from '@storybook/angular'
import { setCompodocJson } from '@storybook/addon-docs/angular'
import {
	defaultPreviewParameters,
	dependencyPreviewDecorators,
} from 'storybook-addon-dependency-previews'
import docJson from '../documentation.json'
import dependenciesJson from './dependency-previews.json'

setCompodocJson(docJson)

declare const __PROJECT_ROOT__: string

const preview: Preview = {
	parameters: {
		...defaultPreviewParameters,
		controls: {
			matchers: {
				// show color picker for args with "color" or "background" in the name
				color: /(background|color)$/i,
				// show date picker for args with "date" in the name
				date: /Date$/i,
			},
		},
		dependencyPreviews: {
			dependenciesJson,
			projectRootPath: __PROJECT_ROOT__,
		},
	},
	decorators: [...dependencyPreviewDecorators],
}

export default preview
