# Storybook Add On - Dependency Previews

[![Dependency Previews logo](https://github.com/Dan503/storybook-addon-dependency-previews/raw/main/storybook-addon-package/readme-images/dependency-previews-logo.png)](https://dependency-previews-storybook-react.netlify.app/?path=/docs/04-templates-home-template--docs)

## What is this?

> **This plugin is built for Storybook 10**

A plugin for [Storybook](https://storybook.js.org/) that shows the full dependency tree in both directions (built with and used by) the components in your application.

Currently works with **React**, **Svelte**, and **Angular**.

This is what you will see in Storybook after Dependency Previews have been installed and configured:

![Dependency Previews - all closed](https://github.com/Dan503/storybook-addon-dependency-previews/raw/main/storybook-addon-package/readme-images/all-closed.png)

The below image demonstrates what you will see when you open up some of the dependency segments:

![Dependency Previews - all open](https://github.com/Dan503/storybook-addon-dependency-previews/raw/main/storybook-addon-package/readme-images/all-open.png)

### Demos

#### React demos

- [React Storybook demo site](https://dependency-previews-storybook-react.netlify.app/?path=/docs/04-templates-home-template--docs)
- [React rendered example website](https://dependency-previews-demo-site-react.netlify.app/)
- [React demo source code](https://github.com/Dan503/storybook-addon-dependency-previews/tree/main/example-site/react)

#### Svelte demos

- [Svelte Storybook demo site](https://dependency-previews-storybook-svelte.netlify.app/)
- [Svelte rendered example website](https://dependency-previews-demo-site-svelte.netlify.app/)
- [Svelte demo source code](https://github.com/Dan503/storybook-addon-dependency-previews/tree/main/example-site/svelte)

#### Angular demos

- [Angular Storybook demo site](https://dependency-previews-storybook-angular.netlify.app/?path=/docs/04-templates-home-template--docs)
- [Angular rendered example website](https://dependency-previews-demo-site-angular.netlify.app/)
- [Angular demo source code](https://github.com/Dan503/storybook-addon-dependency-previews/tree/main/example-site/angular)

<!-- TODO: Provide a video/gif of the addon in action -->

## Installation guide

### Package download

First you will need to install the plugin via npm as well as [dependency-cruiser](https://www.npmjs.com/package/dependency-cruiser)

```
npm install -D storybook-addon-dependency-previews dependency-cruiser
```

<details>
	<summary>Other package managers</summary>
	<p><pre><code>pnpm add -D storybook-addon-dependency-previews dependency-cruiser</code></pre></p>
	<p><pre><code>yarn add -D storybook-addon-dependency-previews dependency-cruiser</code></pre></p>
	<p><pre><code>bun add -D storybook-addon-dependency-previews dependency-cruiser</code></pre></p>
	<p><pre><code>deno add --dev npm:storybook-addon-dependency-previews npm:dependency-cruiser</code></pre></p>
</details>

### Register the add-on

From your root folder, open your `.storybook/main.ts` file.

Edit the `main.ts` to contain the following values or copy/paste the below to replace the full contents of the main.ts file.

#### Register with React

```ts
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.@(ts|tsx|mdx)'],
	addons: [
		// autodocs is required for this addon to work
		'@storybook/addon-docs',
		// the storybook dependency previews addon registration
		'storybook-addon-dependency-previews/addon',
	],
	framework: {
		name: '@storybook/react-vite',
		options: {},
	},
}

export default config
```

#### Register with Svelte

```ts
import type { StorybookConfig } from '@storybook/sveltekit'

const config: StorybookConfig = {
	stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|ts|svelte)'],
	addons: [
		// autodocs is required for this addon to work
		'@storybook/addon-docs',
		// required for .stories.svelte CSF format
		'@storybook/addon-svelte-csf',
		// the storybook dependency previews addon registration
		'storybook-addon-dependency-previews/addon',
	],
	framework: '@storybook/sveltekit',
}

export default config
```

#### Register with Angular

`@storybook/angular` uses webpack5 exclusively. The addon requires two webpack additions in `webpackFinal`: a `DefinePlugin` to inject `__PROJECT_ROOT__` (needed for the VS Code "open file" feature), and a `NormalModuleFactory` plugin to handle the addon's CSS modules correctly.

You will also need a `css-modules-loader.cjs` file alongside your `.storybook/main.ts`. Copy it from the [Angular example source](https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/example-site/angular/.storybook/css-modules-loader.cjs).

```ts
import type { StorybookConfig } from '@storybook/angular'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import path from 'path'

const require = createRequire(import.meta.url)

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

### Bare minimum storybook story example

Get a story ready so you have something to test with.

Below is the bare minimum needed to generate a viable story that is compatible with the add-on.

#### React `.stories.tsx` file example

```ts
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ComponentName } from './ComponentName'

const meta: Meta<typeof ComponentName> = {
	// You can use spaces here to make the title of the story page more human readable
	title: 'Component Name',
	component: ComponentName,
	// autodocs tag is required
	tags: ['autodocs'],
	// The `__filePath` property must be applied to every story file
	// for the addon to track dependencies effectively
	// `import.meta.url` is a Vite specific value that automatically generates the path for you
	parameters: {
		__filePath: import.meta.url,
	},
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {},
}
```

#### Svelte `.stories.svelte` file using [Svelte CSF](https://github.com/storybookjs/addon-svelte-csf)

```svelte
<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import ComponentName from './ComponentName.svelte'

	const { Story } = defineMeta({
		title: 'Component Name',
		component: ComponentName,
		// autodocs tag is required
		tags: ['autodocs'],
		// The `__filePath` property must be applied to every story file
		parameters: {
			__filePath: import.meta.url,
		},
	})
</script>

<Story name="Primary" />
```

#### Angular `.stories.ts` file example

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

### package.json scripts

You will need the following scripts in your `package.json` file:

```json
// package.json
{
	...
	"scripts": {
		...
		"sb": "sb-deps --watch --run-storybook",
		"sb:build": "sb-deps && storybook build",
		"sb:deps": "sb-deps",
		"sb:alt-port": "sb-deps --watch --run-storybook --sb-port 7020"
	}
	...
}
```

Don't run any of these yet, you are not finished with the installation.

`npm run sb` will run storybook in watch mode. It will update the dependency-previews.json file whenever a story file changes, is added, or removed. Use this instead of the `storybook` command to take advantage of automatic dependency tracking while you work and auto scaffolding of stories when new story files are created.

`npm run sb:build` will do a one off compile of your storybook website

`npm run sb:deps` will generate a fresh dependency-previews.json on demand

`npm run sb:alt-port` (optional) will run storybook in watch mode and run it using a specific port number.

#### Angular projects

`@storybook/angular@10+` requires Storybook to be launched through the Angular CLI builder rather than the default `storybook dev` command. Pass the Angular CLI target as an argument to `--run-storybook`:

```json
"sb": "sb-deps --watch --run-storybook \"ng run <project-name>:storybook\""
```

Replace `<project-name>` with the name of your Angular project as defined in `angular.json`.

### Create the preview file

First run `npm run sb:deps` to generate a fresh `dependency-previews.json` file in the `.storybook` folder.

Make sure that the `"resolveJsonModule"` tsConfig.json setting is set to `true` to import this file.

Now create a `.storybook/preview.ts` file (or `preview.tsx` if your framework requires JSX) with the following content:

```ts
/// <reference types="vite/client" />

import {
	defaultPreviewParameters,
	dependencyPreviewDecorators,
	type StorybookPreviewConfig,
} from 'storybook-addon-dependency-previews'

// Import the generated dependency-previews.json file
import dependenciesJson from './dependency-previews.json'

// Global styles are imported here (optional)
import '../src/styles.css'

const previewConfig: StorybookPreviewConfig = {
	decorators: [...dependencyPreviewDecorators],
	parameters: {
		...defaultPreviewParameters,
		dependencyPreviews: {
			dependenciesJson,
			storyModules: import.meta.glob(
				'/src/**/*.stories.@(tsx|ts|jsx|js|svelte)',
				{ eager: false },
			),
			// Replace this with the URL to your src folder in your git repository.
			// This enables the addon to link to the source code of the component.
			sourceRootUrl:
				'https://github.com/your-org/your-repo/blob/main/src',
			// This allows Source File Path to open the
			// component file directly in VS Code when
			// running in a local host environment.
			// `import.meta.url` is a Vite specific feature
			projectRootPath: new URL('..', import.meta.url).pathname,
		},
	},
}

export default previewConfig
```

#### Angular `preview.ts`

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
			// This allows Source File Path to open the component file
			// directly in VS Code when running in a local host environment.
			projectRootPath: __PROJECT_ROOT__,
		},
	},
	decorators: [...dependencyPreviewDecorators],
}

export default preview
```

> **Note:** Angular does not use `storyModules` (no `import.meta.glob`). The addon still generates the full dependency tree via the CLI — only the VS Code "open file" shortcut needs `projectRootPath`.

### Run it!

You should be all set now.

Try running `npm run sb` to boot up storybook, leave it running as you work.

As you create new component files, the component will be auto-scaffolded for you and a matching story file will be created for it automatically. The dependency previews json file will also be auto-updated.

This workflow allows you to focus on what matters instead of having to waste time writing lots of boilerplate code every time you want to create a new component.

## Configuration file (optional)

The `sb-deps` CLI can be customized via a `sb-deps.config.mjs` file in your project root (alongside `package.json`). Supported formats: `.mjs`, `.js`, or `.cjs`.

Use the `defineSbDepsConfig` helper from `storybook-addon-dependency-previews/config` for type safety and editor autocomplete:

```js
// sb-deps.config.mjs
import { defineSbDepsConfig } from 'storybook-addon-dependency-previews/config'

export default defineSbDepsConfig({
	// options go here
})
```

### `angularSelectorPrefix`

_(Angular only)_ The prefix prepended to Angular component selectors when auto-scaffolding new components.

**Default:** `'app-'`

| Value              | Resulting selector |
| ------------------ | ------------------ |
| `'app-'` (default) | `app-button-atom`  |
| `'my-'`            | `my-button-atom`   |
| `''`               | `button-atom`      |

```js
// sb-deps.config.mjs
import { defineSbDepsConfig } from 'storybook-addon-dependency-previews/config'

export default defineSbDepsConfig({
	angularSelectorPrefix: '', // no prefix
})
```

### `scaffold`

Override the templates used when `sb-deps` auto-scaffolds new component and story files. Each template function receives a context object with relevant variables and must return the full file content as a string.

```js
// sb-deps.config.mjs
import { defineSbDepsConfig } from 'storybook-addon-dependency-previews/config'

export default defineSbDepsConfig({
	scaffold: {
		react: {
			/** Customize the generated .tsx component file */
			component: ({ componentName, propsName }) =>
				`export interface ${propsName} {}

export function ${componentName}({}: ${propsName}) {
	return <div>${componentName}</div>
}
`,
			/** Customize the generated .stories.tsx file */
			story: ({ componentName, propsName, title, tags, base }) => '...',
		},
		svelte: {
			/** Customize the generated .svelte component file */
			component: ({ componentName }) => '...',
			/** Customize the generated .stories.svelte file */
			story: ({ componentName, title, tags }) => '...',
		},
		angular: {
			/** Customize the generated .component.ts file */
			component: ({
				componentName,
				className,
				selector,
				base,
				templateLocation,
			}) => '...',
			/** Customize the generated .component.html file (external templates only) */
			componentHtml: ({ componentName }) => '...',
			/** Customize the generated .stories.ts file */
			story: ({ componentName, className, base, title, tags }) => '...',
		},
	},
})
```

All scaffold options are optional — omit any key to keep the default template for that file type.
