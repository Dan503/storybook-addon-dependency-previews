import type { StorybookConfig } from '@storybook/angular'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import path from 'path'

const require = createRequire(import.meta.url)

const config: StorybookConfig = {
	stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
	addons: ['@storybook/addon-docs', 'storybook-addon-dependency-previews/addon'],
	staticDirs: ['../public'],
	framework: {
		name: '@storybook/angular',
		options: {},
	},
	webpackFinal: async (config) => {
		const sbAngularRequire = createRequire(
			import.meta.resolve('@storybook/angular'),
		)
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const webpack = sbAngularRequire('webpack') as any

		// Absolute path to our custom CSS modules loader (CJS, no circular deps)
		const cssModulesLoader = fileURLToPath(
			new URL('./css-modules-loader.cjs', import.meta.url),
		)

		// Absolute path to our global CSS loader (PostCSS + Tailwind, CJS)
		const globalCssLoader = fileURLToPath(
			new URL('./global-css-loader.cjs', import.meta.url),
		)

		config.plugins = config.plugins ?? []
		config.plugins.push(
			new webpack.DefinePlugin({
				__PROJECT_ROOT__: JSON.stringify(
					path.resolve(fileURLToPath(new URL('..', import.meta.url))),
				),
			}),
		)

		// Angular CLI uses oneOf rules without test conditions for its CSS catch-all,
		// so patching module.rules exclusions never reaches it. Instead, use the
		// NormalModuleFactory afterResolve hook to directly replace loaders for the
		// addon's CSS module files with our single CJS loader, which avoids the
		// circular TDZ error that style-loader's ESM pitch output causes in webpack 5.
		config.plugins.push({
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			apply(compiler: any) {
				compiler.hooks.normalModuleFactory.tap(
					'AddonCssModules',
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(factory: any) => {
						factory.hooks.afterResolve.tap(
							'AddonCssModules',
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							(resolveData: any) => {
								const resource: string =
									resolveData.createData?.resource ?? ''
								if (
									resource.endsWith('.module.css') &&
									resource.includes('storybook-addon-dependency-previews')
								) {
									resolveData.createData.loaders = [
										{ loader: cssModulesLoader, options: {} },
									]
								}
								// Process the Angular global stylesheet through PostCSS so
								// Tailwind v4's @import 'tailwindcss' directive is resolved.
								if (resource.replace(/\\/g, '/').endsWith('src/styles.css')) {
									resolveData.createData.loaders = [
										{ loader: globalCssLoader, options: {} },
									]
								}
							},
						)
					},
				)
			},
		})

		return config
	},
}
export default config
