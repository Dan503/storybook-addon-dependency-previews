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

### Quick start (React and Svelte)

After running `npx storybook@latest init` in your project, run the setup wizard:

```sh
npx --package storybook-addon-dependency-previews sb-deps setup
```

(The package's bin is `sb-deps`, but the published package name is `storybook-addon-dependency-previews`. The explicit `--package` form makes `npx` install the right package on the first run; once the wizard has installed the addon, you can use the shorter `npx sb-deps …` form for subsequent calls.)

The wizard:

- detects your framework, package manager, and existing Storybook config,
- installs `storybook-addon-dependency-previews` and `dependency-cruiser`,
- registers the addon in `.storybook/main.ts`,
- patches (or creates) `.storybook/preview.ts` with the addon's parameters and decorators,
- adds the `sb`, `sb:deps`, and `sb:build` scripts to your `package.json`,
- generates the initial `.storybook/dependency-previews.json`.

When it finishes, run `npm run sb` (or your package manager's equivalent) to start Storybook with dependency watching.

### Manual setup

The wizard supports React (`@storybook/react-vite`) and Svelte (`@storybook/sveltekit`, `@storybook/svelte-vite`). For Angular projects, projects on unsupported frameworks, or any case where the wizard can't recognise an existing config, follow one of the framework-specific guides:

- [Manual setup — React](https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/storybook-addon-package/docs/manual-setup-react.md)
- [Manual setup — Svelte](https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/storybook-addon-package/docs/manual-setup-svelte.md)
- [Manual setup — Angular (`@storybook/angular`, webpack)](https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/storybook-addon-package/docs/manual-setup-angular-webpack.md)
- [Manual setup — Next.js (`@storybook/nextjs`, webpack)](https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/storybook-addon-package/docs/manual-setup-nextjs-webpack.md)

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
