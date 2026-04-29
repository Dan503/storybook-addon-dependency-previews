# Manual setup — webpack (`@storybook/angular`, `@storybook/nextjs`)

> The automated `sb-deps setup` wizard only supports Vite-based Storybook frameworks. If your Storybook is webpack-based, follow the steps below. The same instructions cover both `@storybook/angular` and `@storybook/nextjs` — anywhere they differ, the framework-specific bits are called out below the shared step.
>
> **Verification status.** This addon's Angular path is exercised against the [`example-site/angular/`](https://github.com/Dan503/storybook-addon-dependency-previews/tree/main/example-site/angular) project, so the Angular instructions are verified end-to-end. The `@storybook/nextjs` path follows the same shape but **has not been formally tested** — please open an issue if anything in your Next.js project doesn't line up.

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

Both webpack-based Storybook frameworks need two additions in `webpackFinal`:

1. A `DefinePlugin` to inject `__PROJECT_ROOT__` (used by the VS Code "open file" shortcut in the addon's UI).
2. A custom CSS-modules loader for the addon's own `*.module.css` files. style-loader's webpack5 ESM pitch output otherwise produces a circular TDZ error.

You'll also need a `css-modules-loader.cjs` file alongside your `.storybook/main.ts`. **Copy it from the [Angular example source](https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/example-site/angular/.storybook/css-modules-loader.cjs)** — the file is framework-agnostic, so the same copy works for both Angular and Next.js.

The full `main.ts` shape is the same for both frameworks; only the `framework: { name }` value and the way you reach the `webpack` module differ.

### Angular (`@storybook/angular`)

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
		// `@storybook/angular` doesn't expose `webpack` directly; reach in through
		// the framework package so we use the exact version Storybook is using.
		const sbAngularRequire = createRequire(
			import.meta.resolve('@storybook/angular'),
		)
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const webpack = sbAngularRequire('webpack') as any

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
									resource.includes(
										'storybook-addon-dependency-previews',
									)
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

### Next.js (`@storybook/nextjs`)

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
		// Next.js exposes webpack via the standard `require` since `@storybook/nextjs`
		// pulls it as a peer; no `createRequire` dance needed.
		// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
		const webpack = require('webpack') as any

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
									resource.includes(
										'storybook-addon-dependency-previews',
									)
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

## 3. Bare-minimum story example

### Angular `.stories.ts`

```ts
import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { ComponentName } from './ComponentName.component'

const meta: Meta<ComponentName> = {
	title: 'Component Name',
	component: ComponentName,
	// autodocs tag is required
	tags: ['autodocs'],
	// `__filePath` must be set on every story for the addon to track dependencies.
	// `import.meta.url` is a webpack feature available in Angular Storybook.
	// `satisfies StoryParameters` gives you type safety and autocomplete.
	parameters: {
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<ComponentName>

export const Primary: Story = {}
```

### Next.js `.stories.tsx`

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

The `sb:build` and `sb:deps` scripts are the same for both frameworks. The `sb` (watch + serve) script differs because `@storybook/angular` requires Storybook to be launched through the Angular CLI builder rather than the default `storybook dev` command.

### Angular

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

### Next.js

```json
{
	"scripts": {
		"sb": "sb-deps --watch --run-storybook",
		"sb:build": "sb-deps && storybook build",
		"sb:deps": "sb-deps"
	}
}
```

### Both frameworks

- `npm run sb` — Storybook in watch mode with automatic dependency tracking.
- `npm run sb:build` — one-off compile of the static Storybook site.
- `npm run sb:deps` — generate a fresh `dependency-previews.json` on demand.

**Optional** — add this manually if your default port (6006) is in use. The `--sb-port` flag is appended to the Storybook launch command, so it works for both frameworks:

```json
"sb:alt-port": "sb-deps --watch --run-storybook --sb-port 7020"
```

## 5. Generate the dependency graph file

```sh
npm run sb:deps
```

This creates `.storybook/dependency-previews.json`. Make sure `"resolveJsonModule": true` is set in your `tsconfig.json` so the next step can import it.

## 6. Create `.storybook/preview.ts`

Webpack doesn't expose `import.meta.glob`, so use the `__PROJECT_ROOT__` value injected by `DefinePlugin` in `main.ts`. The shape of `preview.ts` is identical for Angular and Next.js — only the `Preview` type's import source changes.

### Angular

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

### Next.js

Identical to the Angular `preview.ts`, just import `Preview` from `@storybook/nextjs` instead:

```ts
import type { Preview } from '@storybook/nextjs'
// ... rest identical to the Angular version above
```

> Webpack-based projects don't use `storyModules` (no `import.meta.glob`). The CLI still generates the full dependency tree — `projectRootPath` is only used for the addon's "open in VS Code" feature.

## 7. Run it

```sh
npm run sb
```

See the [main README](../README.md) for the optional `sb-deps.config.mjs` configuration file (including the `angularSelectorPrefix` option, relevant for Angular projects only).
