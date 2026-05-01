import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.@(ts|tsx|mdx|svelte|vue)'],
	addons: [
		// register your addon
		'storybook-addon-dependency-previews/addon',
	],
	framework: {
		name: '@storybook/react-vite', // or @storybook/*-vite for your framework
		options: {},
	},
	staticDirs: ['../public', './public'],
}

export default config
