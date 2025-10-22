import { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.@(ts|tsx|mdx|svelte|vue)'],
	addons: [
		'@storybook/addon-docs',
		// register your addon (panel available in UI)
		'storybook-addon-dependency-previews/addon',
	],
	framework: {
		name: '@storybook/react-vite', // or @storybook/*-vite for your framework
		options: {},
	},
	staticDirs: ['.'],
}

export default config
