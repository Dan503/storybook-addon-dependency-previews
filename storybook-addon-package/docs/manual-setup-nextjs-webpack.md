# Manual setup — Next.js (`@storybook/nextjs`, webpack)

> **Note:** the automated `sb-deps setup` wizard only supports Vite-based Storybook frameworks. `@storybook/nextjs` is webpack-based, so you'll need to wire the addon up by hand using the steps below.
>
> **Untested.** This addon has not been verified against `@storybook/nextjs`'s webpack setup. The instructions below are adapted from the [Angular manual-setup guide](./manual-setup-angular.md) (the only webpack-based example the addon is currently exercised against). Treat this as a starting point and please open an issue if anything in your Next.js project doesn't line up.
>
> If you want first-class wizard support without the webpack workaround, switch your Storybook framework to `@storybook/nextjs-vite` — that's a Vite-based Next.js framework and is on the roadmap for wizard support once it's been tested.

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

`@storybook/nextjs` uses webpack5. The addon needs two webpack additions inside `webpackFinal`:

1. A `DefinePlugin` to inject `__PROJECT_ROOT__` (used by the VS Code "open file" shortcut in the addon's UI).
2. A custom CSS-modules loader for the addon's own `*.module.css` files (style-loader's webpack5 ESM pitch output otherwise produces a circular TDZ error).

Copy the [`css-modules-loader.cjs`](https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/example-site/angular/.storybook/css-modules-loader.cjs) file from the Angular example into your `.storybook/` directory — it's framework-agnostic and applies as-is.

```ts
import type { StorybookConfig } from '@storybook/nextjs'
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
		name: '@storybook/nextjs',
		options: {},
	},
	webpackFinal: async (config) => {
		// Pull `webpack` from the same install Storybook is using.
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const webpack = require('webpack')

		// Path to the css-modules-loader.cjs file (copy from the Angular example source linked above).
		const cssModulesLoader = fileURLToPath(
			new URL('./css-modules-loader.cjs', import.meta.url),
		)

		config.plugins = config.plugins ?? []

		// Inject __PROJECT_ROOT__ so preview.ts can pass it to projectRootPath.
		config.plugins.push(
			new webpack.DefinePlugin({
				__PROJECT_ROOT__: JSON.stringify(
					path.resolve(fileURLToPath(new URL('..', import.meta.url))),
				),
			}),
		)

		// Handle CSS modules for the addon's dist files.
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
									resource.includes('storybook-addon-dependency-previews')
								) {
									resolveData.createData.loaders = [
										{ loader: cssModulesLoader, options: {} },
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

## 3. Bare-minimum `.stories.tsx` example

```tsx
import type { Meta, StoryObj } from '@storybook/nextjs'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { ComponentName } from './ComponentName'

const meta: Meta<typeof ComponentName> = {
	title: 'Component Name',
	component: ComponentName,
	// autodocs tag is required
	tags: ['autodocs'],
	// `__filePath` must be set on every story for the addon to track dependencies.
	// `import.meta.url` is a webpack feature available in modern Next.js Storybook.
	// `satisfies StoryParameters` gives you type safety and autocomplete.
	parameters: {
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {}
```

## 4. `package.json` scripts

```json
{
	"scripts": {
		"sb": "sb-deps --watch --run-storybook",
		"sb:build": "sb-deps && storybook build",
		"sb:deps": "sb-deps"
	}
}
```

- `npm run sb` — Storybook in watch mode with automatic dependency tracking.
- `npm run sb:build` — one-off compile of the static Storybook site.
- `npm run sb:deps` — generate a fresh `dependency-previews.json` on demand.

**Optional** — add this manually if your default port (6006) is in use:

```json
"sb:alt-port": "sb-deps --watch --run-storybook --sb-port 7020"
```

## 5. Generate the dependency graph file

```sh
npm run sb:deps
```

This creates `.storybook/dependency-previews.json`. Make sure `"resolveJsonModule": true` is set in your `tsconfig.json` so the next step can import it.

## 6. Create `.storybook/preview.ts`

Webpack doesn't expose `import.meta.glob`, so use the `__PROJECT_ROOT__` value injected by `DefinePlugin` in `main.ts`:

```ts
import type { Preview } from '@storybook/nextjs'
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
			sourceRootUrl:
				'https://github.com/your-org/your-repo/blob/main/src',
			// __PROJECT_ROOT__ is injected by DefinePlugin in main.ts.
			projectRootPath: __PROJECT_ROOT__,
		},
	},
	decorators: [...dependencyPreviewDecorators],
}

export default preview
```

> Webpack-based projects don't use `storyModules` (no `import.meta.glob`). The CLI still generates the full dependency tree — `projectRootPath` is only used for the addon's "open in VS Code" feature.

## 7. Run it

```sh
npm run sb
```

See the [main README](../README.md) for the optional `sb-deps.config.mjs` configuration file.
