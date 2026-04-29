# Manual setup — Angular (`@storybook/angular`, webpack)

> **Note:** the automated `sb-deps setup` wizard only supports Vite-based Storybook frameworks. `@storybook/angular` is webpack-based, so you'll need to wire the addon up by hand using the steps below.
>
> If a Vite-based Angular Storybook framework ships in the future, the wizard will route it to a separate "Angular" guide and this doc will stay as the webpack reference.

## 1. Install the addon

```sh
npm install -D storybook-addon-dependency-previews dependency-cruiser
```

<details>
<summary>Other package managers</summary>

```sh
pnpm add -D storybook-addon-dependency-previews dependency-cruiser
```

```sh
yarn add -D storybook-addon-dependency-previews dependency-cruiser
```

```sh
bun add -d storybook-addon-dependency-previews dependency-cruiser
```

</details>

## 2. Register the addon in `.storybook/main.ts`

`@storybook/angular` uses webpack5 exclusively. The addon requires two webpack additions in `webpackFinal`: a `DefinePlugin` to inject `__PROJECT_ROOT__` (needed for the VS Code "open file" feature), and a `NormalModuleFactory` plugin to handle the addon's CSS modules correctly.

You will also need a `css-modules-loader.cjs` file alongside your `.storybook/main.ts`. Copy it from the [Angular example source](https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/example-site/angular/.storybook/css-modules-loader.cjs).

```ts
import type { StorybookConfig } from '@storybook/angular'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import path from 'path'

const config: StorybookConfig = {
	stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
	addons: [
		// autodocs is required for this addon to work
		'@storybook/addon-docs',
		// the storybook dependency previews addon registration
		'storybook-addon-dependency-previews/addon',
	],
	framework: {
		name: '@storybook/angular',
		options: {},
	},
	webpackFinal: async (config) => {
		const sbAngularRequire = createRequire(
			import.meta.resolve('@storybook/angular'),
		)
		const webpack = sbAngularRequire('webpack') as any

		// Path to the css-modules-loader.cjs file (copy from the Angular example source)
		const cssModulesLoader = fileURLToPath(
			new URL('./css-modules-loader.cjs', import.meta.url),
		)

		config.plugins = config.plugins ?? []

		// Inject __PROJECT_ROOT__ so preview.ts can pass it to projectRootPath
		config.plugins.push(
			new webpack.DefinePlugin({
				__PROJECT_ROOT__: JSON.stringify(
					path.resolve(fileURLToPath(new URL('..', import.meta.url))),
				),
			}),
		)

		// Handle CSS modules for the addon's dist files
		config.plugins.push({
			apply(compiler: any) {
				compiler.hooks.normalModuleFactory.tap(
					'AddonCssModules',
					(factory: any) => {
						factory.hooks.afterResolve.tap(
							'AddonCssModules',
							(resolveData: any) => {
								const resource: string =
									resolveData.createData?.resource ?? ''
								if (
									resource.endsWith('.module.css') &&
									resource.includes(
										'storybook-addon-dependency-previews',
									)
								) {
									resolveData.createData.loaders = [
										{
											loader: cssModulesLoader,
											options: {},
										},
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
```

## 3. Bare-minimum `.stories.ts` example

```ts
import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { ComponentName } from './ComponentName.component'

const meta: Meta<ComponentName> = {
	// You can use spaces here to make the title of the story page more human readable
	title: 'Component Name',
	component: ComponentName,
	// autodocs tag is required
	tags: ['autodocs'],
	// The `__filePath` property must be applied to every story file
	// for the addon to track dependencies effectively
	// `import.meta.url` is a webpack feature available in Angular Storybook
	parameters: {
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<ComponentName>

export const Primary: Story = {}
```

## 4. `package.json` scripts

`@storybook/angular@10+` requires Storybook to be launched through the Angular CLI builder rather than the default `storybook dev` command. Pass the Angular CLI target as an argument to `--run-storybook`:

```json
{
	"scripts": {
		"sb": "sb-deps --watch --run-storybook \"ng run <project-name>:storybook\"",
		"sb:build": "sb-deps && ng run <project-name>:build-storybook",
		"sb:deps": "sb-deps"
	}
}
```

Replace `<project-name>` with the name of your Angular project as defined in `angular.json`.

## 5. Generate the dependency graph file

```sh
npm run sb:deps
```

This creates `.storybook/dependency-previews.json`. Make sure `"resolveJsonModule": true` is set in your `tsconfig.json` so the next step can import it.

## 6. Create `.storybook/preview.ts`

Angular uses webpack, so `import.meta.glob` and Vite-specific APIs are not available. Use the `__PROJECT_ROOT__` value injected via `DefinePlugin` in `main.ts` instead:

```ts
import type { Preview } from '@storybook/angular'
import {
	defaultPreviewParameters,
	dependencyPreviewDecorators,
} from 'storybook-addon-dependency-previews'
import dependenciesJson from './dependency-previews.json'

declare const __PROJECT_ROOT__: string

const preview: Preview = {
	parameters: {
		...defaultPreviewParameters,
		dependencyPreviews: {
			dependenciesJson,
			// Replace this with the URL to your src folder in your git repository.
			// This enables the addon to link to the source code of the component.
			sourceRootUrl:
				'https://github.com/your-org/your-repo/blob/main/src',
			// __PROJECT_ROOT__ is injected by DefinePlugin in main.ts.
			// Allows opening the component file directly in VS Code when running locally.
			projectRootPath: __PROJECT_ROOT__,
		},
	},
	decorators: [...dependencyPreviewDecorators],
}

export default preview
```

> **Note:** Angular does not use `storyModules` (no `import.meta.glob`). The addon still generates the full dependency tree via the CLI — only the VS Code "open file" shortcut needs `projectRootPath`.

## 7. Run it

```sh
npm run sb
```

See the [main README](../README.md) for the optional `sb-deps.config.mjs` configuration file (including the `angularSelectorPrefix` option).
