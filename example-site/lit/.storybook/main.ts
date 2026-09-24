import type { StorybookConfig } from '@storybook/web-components-vite'

const config: StorybookConfig = {
	stories: ['../src/**/*.mdx', '../src/**/*.stories.ts'],
	addons: [
		'@chromatic-com/storybook',
		'storybook-addon-dependency-previews/addon',
	],
	framework: '@storybook/web-components-vite',
	// The site header draws the logo from here.
	staticDirs: ['../public'],
}

export default config
