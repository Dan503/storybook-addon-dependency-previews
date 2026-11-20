import reactDocgenTypescript from '@joshwooding/vite-plugin-react-docgen-typescript'
import { react } from '@storybook-astro/framework/integrations'

export default {
	stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
	addons: ['@storybook/addon-docs'],
	framework: {
		name: '@storybook-astro/framework',
		options: {
			integrations: [react({ include: ['**/*.tsx'] })],
		},
	},
	// Reads the comments on React components and their props, so their docs pages
	// show descriptions. Storybook's React framework adds this plugin itself; the
	// Astro framework does not. The options are the ones Storybook's React
	// framework passes.
	viteFinal: (config) => ({
		...config,
		plugins: [
			...(config.plugins ?? []),
			reactDocgenTypescript({
				include: ['**/*.tsx'],
				shouldExtractLiteralValuesFromEnum: true,
				shouldRemoveUndefinedFromOptional: true,
				// Leaves out props that come from installed packages, such as every
				// attribute a plain HTML element takes
				propFilter: (prop) =>
					prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
				savePropValueAsString: true,
			}),
		],
	}),
}
