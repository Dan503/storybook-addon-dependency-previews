import type { StorybookConfig } from '@storybook/preact-vite'

const config: StorybookConfig = {
	stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
	addons: [
		'@chromatic-com/storybook',
		'storybook-addon-dependency-previews/addon',
	],
	framework: '@storybook/preact-vite',
	// The site header draws the logo from here, and the document head takes its
	// icons from here too.
	staticDirs: ['../public'],
}

export default config
