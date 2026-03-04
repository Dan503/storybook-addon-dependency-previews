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
	// 3. Deduplicate storybook/theming to prevent split ThemeContext instances (see below)
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

		// Force all storybook/theming imports to resolve to a single module instance.
		//
		// Root cause: this pnpm workspace has two storybook versions — the addon package
		// (storybook-addon-dependency-previews) carries storybook@^10.0.2 as a devDependency
		// while this project uses storybook@^10.2.13. pnpm installs both. When webpack
		// bundles the preview, it resolves storybook/theming to v10.0.2 for files originating
		// from the addon package directory and to v10.2.13 for this project's own files.
		//
		// Each version calls React.createContext({}) for its own ThemeContext, so there are
		// two separate context objects. DocsContainer's <ThemeProvider> (v10.2.13) populates
		// ThemeContext_v10.2.13, but withReset's styled component reads ThemeContext_v10.0.2,
		// which is still {} — causing "theme.typography is undefined".
		//
		// Vite (used by the React example site) avoids this via its native ESM deduplication.
		// Webpack needs the explicit alias below to pin every storybook/theming import to the
		// same physical file so both share one ThemeContext instance.
		webpackConfig.resolve = webpackConfig.resolve ?? {}
		webpackConfig.resolve.alias = {
			...(webpackConfig.resolve.alias as Record<string, string>),
			// The $ suffix makes this an exact-match alias — without it, webpack's prefix
			// matching would also redirect 'storybook/theming/create' → index.js/create
			// which doesn't exist, causing a module-not-found error.
			'storybook/theming$': path.resolve(__dirname, '../node_modules/storybook/dist/theming/index.js'),
		}

		return webpackConfig
	},
}

export default config
