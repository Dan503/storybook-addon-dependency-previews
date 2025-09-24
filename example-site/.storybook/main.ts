import type { StorybookConfig } from 'storybook'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Create a Vite plugin that injects lineage.json as a virtual module
function dependencyPreviewsVirtualPlugin() {
	const virtId = 'virtual:dependency-previews-json'
	const resolved = '\0' + virtId
	return {
		name: 'dependency-previews-virtual-json',
		resolveId(id: string) {
			return id === virtId ? resolved : null
		},
		load(id: string) {
			if (id === resolved) {
				const jsonPath = resolve(
					__dirname,
					'./dependency-previews.json',
				)
				const json = readFileSync(jsonPath, 'utf8')
				return `export default ${json};`
			}
			return null
		},
	}
}

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.@(ts|tsx|mdx|svelte|vue)'],
	addons: [
		'@storybook/addon-docs',
		// register your addon (panel available in UI)
		'storybook-addon-dependency-previews',
	],
	framework: {
		name: '@storybook/react-vite', // or @storybook/*-vite for your framework
		options: {},
	},
	async viteFinal(cfg) {
		cfg.plugins = cfg.plugins || []
		cfg.plugins.push(dependencyPreviewsVirtualPlugin())
		return cfg
	},
}

export default config
