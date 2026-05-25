import type { StorybookConfig } from '@storybook/vue3-vite'
import vue from '@vitejs/plugin-vue'
import { mergeConfig } from 'vite'

const config: StorybookConfig = {
	stories: ['../components/**/*.stories.@(ts|tsx|mdx)'],
	addons: [
		// register your addon
		'storybook-addon-dependency-previews/addon',
	],
	framework: {
		name: '@storybook/vue3-vite',
		options: {},
	},
	staticDirs: ['../public'],
	// `@storybook/vue3-vite` ships only Storybook-specific Vue helpers (template
	// compilation, component-meta plugin) — it does NOT bundle `@vitejs/plugin-vue`.
	// We add it here so `.vue` SFC imports actually parse during the Storybook build.
	viteFinal: async (viteConfig) =>
		mergeConfig(viteConfig, {
			plugins: [vue()],
		}),
}

export default config
