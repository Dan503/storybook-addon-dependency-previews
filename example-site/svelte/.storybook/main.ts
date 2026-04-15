import type { StorybookConfig } from '@storybook/sveltekit'
import { mergeConfig } from 'vite'

const config: StorybookConfig = {
	stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|ts|svelte)'],
	addons: [
		'@storybook/addon-svelte-csf',
		'@chromatic-com/storybook',
		'@storybook/addon-vitest',
		'@storybook/addon-a11y',
		'@storybook/addon-docs',
	],
	framework: '@storybook/sveltekit',
	async viteFinal(config) {
		return mergeConfig(config, {
			resolve: {
				dedupe: ['styled-components'],
			},
		})
	},
}
export default config