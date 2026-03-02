import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import type { StorybookConfig } from '@storybook/angular'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const config: StorybookConfig = {
	stories: [
		'../src/**/*.mdx',
		'../src/**/*.stories.@(js|ts)',
	],
	addons: [
		'@storybook/addon-docs',
		'storybook-addon-dependency-previews/addon',
	],
	framework: {
		name: '@storybook/angular',
		options: {},
	},
	staticDirs: ['../public'],
	// @storybook/angular uses webpack (not Vite). webpackFinal is needed to:
	// 1. Inject __PROJECT_ROOT__ for the VS Code "open file" links in preview.ts
	// 2. Add CSS Module loader for the addon's dist files (not covered by Angular's defaults)
	async webpackFinal(webpackConfig) {
		// Webpack and its loaders are @storybook/angular's deps, not direct deps.
		// Access them via createRequire through @storybook/angular's resolution.
		const sbAngularUrl = import.meta.resolve('@storybook/angular')
		const sbAngularRequire = createRequire(sbAngularUrl)

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { DefinePlugin } = sbAngularRequire('webpack') as any
		const cssLoader = sbAngularRequire.resolve('css-loader')
		const styleLoader = sbAngularRequire.resolve('style-loader')

		webpackConfig.plugins = webpackConfig.plugins ?? []
		webpackConfig.plugins.push(
			new DefinePlugin({
				// Makes the project root filesystem path available in preview.ts
				__PROJECT_ROOT__: JSON.stringify(path.resolve(__dirname, '..')),
			}),
		)

		// Angular's webpack config has no CSS loader for addon dist files (outside project root).
		// Add a rule to process .module.css files from the addon's dist directory.
		webpackConfig.module = webpackConfig.module ?? { rules: [] }
		webpackConfig.module.rules = webpackConfig.module.rules ?? []
		webpackConfig.module.rules.push({
			test: /\.module\.css$/,
			include: /storybook-addon-package[/\\]dist/,
			use: [
				styleLoader,
				{
					loader: cssLoader,
					options: {
						modules: {
							auto: true,
							localIdentName: '[hash:base64]',
						},
					},
				},
			],
		})

		return webpackConfig
	},
}

export default config
