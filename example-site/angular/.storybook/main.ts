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

		// -----------------------------------------------------------------------
		// NOTE: Everything in this block (the axios/zod aliases, the
		// NormalModuleReplacementPlugin, and the associated stub files) only
		// exists because this example site imports from `example-site-shared`,
		// a cross-workspace TypeScript package that depends on zod and axios.
		// In a normal Angular Storybook project you would not need any of this.
		// -----------------------------------------------------------------------

		const sharedDataStub = fileURLToPath(new URL('./shared-data-stub.cjs', import.meta.url))

		config.resolve = config.resolve ?? {}
		config.resolve.alias = {
			...(config.resolve.alias as object ?? {}),
			// Redirect example-site-shared/data to a plain CJS stub via resolve.alias
			// (checked before tsconfig-paths runs, so the TypeScript source is never loaded).
			'example-site-shared/data': sharedDataStub,
			// Safety-net stubs in case any other path introduces axios/zod into the bundle.
			'axios': fileURLToPath(new URL('./axios-stub.cjs', import.meta.url)),
			'zod': fileURLToPath(new URL('./zod-stub.cjs', import.meta.url)),
		}

		config.plugins = config.plugins ?? []

		// NormalModuleReplacementPlugin fires at `normalModuleFactory.beforeResolve` —
		// BEFORE tsconfig-paths-webpack-plugin (which runs at the resolve phase).
		// This ensures 'example-site-shared/data' is redirected to our plain-CJS stub
		// before Angular's path resolver can map it to the TypeScript source, which would
		// trigger @ngtools/webpack trying to compile zod v4's complex types (causing a hang).
		config.plugins.push(
			new webpack.NormalModuleReplacementPlugin(
				/^example-site-shared\/data$/,
				sharedDataStub,
			),
		)

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
