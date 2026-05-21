# Storybook Add On - Dependency Previews

[![Dependency Previews logo](https://github.com/Dan503/storybook-addon-dependency-previews/raw/main/storybook-addon-package/readme-images/dependency-previews-logo.png)](https://dependency-previews-storybook-react.netlify.app/?path=/docs/04-templates-home-template--docs)

## What is this?

> **This plugin is built for Storybook 10**

A plugin for [Storybook](https://storybook.js.org/) that shows the full dependency tree in both directions (built with and used by) the components in your application.

Currently works with **React**, **Svelte**, **Angular**, and **Next.js**. The automated `sb-deps setup` wizard handles Vite-based projects (React, Svelte) end-to-end. Webpack-based projects (Angular, Next.js) need a one-time manual setup — see the [manual-setup-webpack guide](https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/storybook-addon-package/docs/manual-setup-webpack.md) below.

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

<details>
<summary>Other package managers</summary>

```sh
pnpm dlx --package=storybook-addon-dependency-previews sb-deps setup
```

```sh
yarn dlx --package storybook-addon-dependency-previews sb-deps setup
```

```sh
bunx --package storybook-addon-dependency-previews sb-deps setup
```

</details>

(The package's bin is `sb-deps`, but the published package name is `storybook-addon-dependency-previews`. The explicit `--package` form makes the runner install the right package on the first run; once the wizard has installed the addon, you can use the shorter `<runner> sb-deps …` form for subsequent calls — e.g. `pnpm sb-deps`, `yarn sb-deps`, `bun sb-deps`.)

The wizard:

- detects your framework, package manager, and existing Storybook config,
- installs `storybook-addon-dependency-previews` and `dependency-cruiser`,
- registers the addon in `.storybook/main.ts`,
- patches (or creates) `.storybook/preview.ts` with the addon's parameters and decorators,
- adds the `sb`, `sb:deps`, and `sb:build` scripts to your `package.json`,
- generates the initial `.storybook/dependency-previews.json`.

When it finishes, run `npm run sb` (or your package manager's equivalent) to start Storybook with dependency watching.

**Source directory.** The wizard (and the `sb-deps` CLI more generally) assumes your application source files live under the `src/` folder of your project. If your project uses a different top-level directory to hold source files — `app/`, `source/`, anything else — place a `sb-deps.config.mjs` in the root folder of your project and set the [`srcDir`](#srcdir) option to the name of your source folder.

### Manual setup

The wizard supports React (`@storybook/react-vite`) and Svelte (`@storybook/sveltekit`, `@storybook/svelte-vite`) — all Vite-based. **Angular (`@storybook/angular`) and Next.js (`@storybook/nextjs`) projects are both webpack-based and require manual setup** — the wizard's preview-patcher relies on Vite's `import.meta.glob`, which webpack doesn't expose. Follow the matching guide below:

- [Manual setup — Vite (React, Svelte)](https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/storybook-addon-package/docs/manual-setup-vite.md)
- [Manual setup — webpack (`@storybook/angular`, `@storybook/nextjs`)](https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/storybook-addon-package/docs/manual-setup-webpack.md)

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

### `srcDir`

The top-level source directory (relative to your project root) that the addon scans for components and stories. Every key in the generated `.storybook/dependency-previews.json` starts with this prefix.

**Default:** `'src'`

Set this if your project's source lives somewhere other than `src/` — for example `app/` for some Nuxt / Next-style layouts, or `source/` if that's your team's convention:

```js
// sb-deps.config.mjs
import { defineSbDepsConfig } from 'storybook-addon-dependency-previews/config'

export default defineSbDepsConfig({
	srcDir: 'app',
})
```

**Constraints.** Must be a single directory name (no path separators) made of alphanumerics, `.`, `_`, or `-`. Anything containing glob metacharacters (`*`, `?`, `[`, `]`, `{`, `}`) or shell metacharacters (`%`, `^`, `&`, `|`, `<`, `>`, `(`, `)`, `!`) is rejected at load time — the CLI warns and falls back to `'src'`. Examples that are fine: `'src'`, `'app'`, `'source'`, `'my-source'`, `'app.v2'`. Examples that are rejected: `'src/components'`, `'src/*'`, `'%PROJECT%'`, `''`.

**Note for non-`src` layouts.** The `srcDir` option re-points the dep-cruiser scan, the watcher globs, and the dependency-graph lookup. It does **not** rewrite the bundled `cli/scripts/depcruise.config.ts`'s `warn`-level `forbidden` rules — those still reference `^src` literally and won't fire on a non-`src` tree. If you want those warnings (`no-orphans-in-components`, `no-node-modules-imports`) to fire against your custom layout, drop your own `depcruise.config.cjs` (or `.dependency-cruiser.{js,cjs}`) in your project root with the matching `path:` patterns — the CLI picks up project-root overrides automatically. The dependency-previews graph itself works fine in either case.

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
			/** Customize the generated .decorator.svelte file */
			decorator: ({ componentName }) => '...',
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

### Svelte decorators

Storybook decorators in Svelte are cleanest when written as their own `.svelte` file rather than inline in a story. `sb-deps` recognises decorator files by the `.decorator.svelte` suffix and treats them specially: it scaffolds them with a decorator-shaped template (importing and rendering the wrapped sibling component) and **does not** generate a `.stories.svelte` for them.

#### Recommended pattern: one shared decorator per component

Name the file `ComponentName.decorator.svelte` and use **props** to vary behaviour between stories. This is the preferred approach because it avoids near-duplicate decorator files for each story.

```svelte
<!-- ContactFormOrganism.decorator.svelte -->
<script lang="ts">
	import type { ValidationMode } from '@formisch/svelte';
	import FormDataMolecule from '../../zz-meta-components/FormDataPreview/FormDataMolecule.svelte';
	import ContactFormOrganism from './ContactFormOrganism.svelte';
	import { createContactForm, onContactFormSubmit } from './createContactForm';

	interface DecoratorProps {
		validate?: ValidationMode;
	}

	const { validate }: DecoratorProps = $props();

	const form = $derived(createContactForm(validate));
</script>

<!--
 Decorator files are useful for adding extra wrapper
 components as additional context to stories
-->
<FormDataMolecule {form}>
	<ContactFormOrganism {form} onSubmit={onContactFormSubmit} />
</FormDataMolecule>
```

```svelte
<!-- ContactFormOrganism.stories.svelte (excerpt) -->
<Story name="Primary">
	{#snippet template()}
		<ContactFormOrganismDecorator validate="submit" />
	{/snippet}
</Story>

<Story name="Error State">
	{#snippet template()}
		<ContactFormOrganismDecorator validate="initial" />
	{/snippet}
</Story>
```

#### Fallback pattern: per-story decorator files

If a particular story needs a decorator with a structurally different shape that can't reasonably be expressed via props, name the file `ComponentName.StoryName.decorator.svelte`. The wrapped component name is always the segment before the first `.` in the filename.

| Filename                          | Wrapped component | When to use                                                                       |
| --------------------------------- | ----------------- | --------------------------------------------------------------------------------- |
| `Button.decorator.svelte`         | `Button`          | Default — single decorator for all stories, drive variants via props              |
| `Button.Primary.decorator.svelte` | `Button`          | Fallback — only when the `Primary` story needs a structurally different decorator |
| `Button.Error.decorator.svelte`   | `Button`          | Fallback — only when the `Error` story needs a structurally different decorator   |

#### Default scaffold

When `sb-deps` detects a new empty `*.decorator.svelte` file, it fills it with:

```svelte
<script lang="ts">
	import Button from "./Button.svelte";

	interface DecoratorProps {
	}

	const {  }: DecoratorProps = $props();
</script>

<div class="decorator">
	<Button />
</div>
```

The wrapper `<div class="decorator">` is a hint, not a requirement — replace it with whatever the decorator actually needs to wrap around the component (a form provider, a router, a theme context, …). Customise the whole template via [`scaffold.svelte.decorator`](#scaffold) in your `sb-deps.config.{js,mjs,ts}`.
