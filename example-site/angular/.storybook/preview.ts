import {
	defaultPreviewParameters,
	type StorybookPreviewConfig,
	type StoryModules,
} from 'storybook-addon-dependency-previews'
// Note: src/styles.css is NOT imported here because Angular's @storybook/angular
// builder automatically applies it from the `styles` array in angular.json.
import dependenciesJson from './dependency-previews.json'
import { themes } from 'storybook/theming'

// Injected at build time by webpack DefinePlugin in .storybook/main.ts
declare const __PROJECT_ROOT__: string

// Build story modules map using webpack's require.context
// Keys are normalised to Vite-style absolute paths (/src/...) so they match
// the storyFilePath values from dependency-previews.json
const req = require.context('../src', true, /\.stories\.(ts|js)$/)
const storyModules: StoryModules = Object.fromEntries(
	req
		.keys()
		.map((key) => [
			'/src/' + key.replace(/^\.\//, ''),
			() => Promise.resolve(req(key)),
		]),
)

const previewConfig: StorybookPreviewConfig = {
	parameters: {
		...defaultPreviewParameters,
		docs: {
			...defaultPreviewParameters?.['parameters']?.docs,
			// Provide an explicit Storybook theme so that @storybook/addon-docs styled
			// components (withReset etc.) receive a properly-shaped theme object via the
			// emotion ThemeProvider.  Without this, Angular Storybook renders docs pages
			// with an empty theme and throws "theme.typography is undefined".
			theme: themes.light,
		},
		dependencyPreviews: {
			dependenciesJson,
			projectRootPath: __PROJECT_ROOT__,
			storyModules,
			sourceRootUrl:
				'https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/example-site/angular',
		},
	},
}

export default previewConfig
