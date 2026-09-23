# Manual setup — Vite (React, Preact, Svelte, Vue 3, Solid, Lit)

> **Tip:** for most Vite-based projects you can use the automated wizard instead:
>
> ```sh
> npx --package storybook-addon-dependency-previews sb-deps setup
> ```
>
> The steps below describe what the wizard does, in case you'd rather configure things by hand or the wizard couldn't recognise your existing config.
>
> The same instructions cover all currently-supported Vite-based Storybook frameworks (React, Preact, Svelte with SvelteKit, vanilla Svelte, Vue 3, Solid, Lit / web components). Anywhere they diverge, both/all options are inlined into the same code block with `// if using React` / `// if using Preact` / `// if using Svelte` / `// if using Vue` / `// if using Solid` / `// if using Lit` comments — **pick one of each pair when you copy/paste**. Step 3 (the story example) is the place where three shapes are too different to inline — React's `.stories.tsx`, Svelte CSF's `.stories.svelte`, and Lit's `.stories.ts` (which names a browser tag rather than a component object, renders with Lit's `html`, and imports its component on two lines) — so each has its own code block (Preact, Vue and Solid stories use the same `.stories.ts`/`.stories.tsx` shape as React — see the React example and swap the framework import for your framework's package (`@storybook/preact-vite`, `@storybook/vue3-vite` or `storybook-solidjs-vite`) and the component import for your Preact `.tsx`, `.vue` SFC or Solid `.tsx`).

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

```ts
import type { StorybookConfig } from '@storybook/react-vite' // if using React
import type { StorybookConfig } from '@storybook/preact-vite' // if using Preact
import type { StorybookConfig } from '@storybook/sveltekit' // if using Svelte (SvelteKit)
import type { StorybookConfig } from '@storybook/svelte-vite' // if using Svelte (without SvelteKit)
import type { StorybookConfig } from '@storybook/vue3-vite' // if using Vue 3
import type { StorybookConfig } from 'storybook-solidjs-vite' // if using Solid
import type { StorybookConfig } from '@storybook/web-components-vite' // if using Lit

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.@(ts|tsx|mdx)'], // if using React, Preact, Vue, Solid, or Lit
	stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|ts|svelte)'], // if using Svelte
	addons: [
		// autodocs is required for this addon to work
		'@storybook/addon-docs',
		// required for .stories.svelte CSF format (Svelte projects only — delete if using React, Preact, Vue, Solid, or Lit)
		'@storybook/addon-svelte-csf',
		// the storybook dependency previews addon registration
		'storybook-addon-dependency-previews/addon',
	],
	framework: { name: '@storybook/react-vite', options: {} }, // if using React
	framework: '@storybook/preact-vite', // if using Preact
	framework: '@storybook/sveltekit', // if using Svelte (SvelteKit)
	framework: '@storybook/svelte-vite', // if using Svelte (without SvelteKit)
	framework: '@storybook/vue3-vite', // if using Vue 3
	framework: 'storybook-solidjs-vite', // if using Solid
	framework: '@storybook/web-components-vite', // if using Lit
}

export default config
```

## 3. Bare-minimum story example

The React, Svelte and Lit story formats are different enough that inlining them isn't useful — pick the section matching your framework.

### React `.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { ComponentName } from './ComponentName'

const meta: Meta<typeof ComponentName> = {
	// You can use spaces here to make the title of the story page more human readable
	title: 'Component Name',
	component: ComponentName,
	// autodocs tag is required
	tags: ['autodocs'],
	// `satisfies StoryParameters` gives proper autocomplete on `layout` (and discoverability of the optional `__filePath` fallback) instead of Storybook's loose `string` type.
	parameters: {
		layout: 'padded',
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {},
}
```

### Svelte `.stories.svelte` (using [Svelte CSF](https://github.com/storybookjs/addon-svelte-csf))

```svelte
<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews'
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import ComponentName from './ComponentName.svelte'

	const { Story } = defineMeta({
		title: 'Component Name',
		component: ComponentName,
		// autodocs tag is required
		tags: ['autodocs'],
		parameters: {
			layout: 'padded',
		} satisfies StoryParameters,
	})
</script>

<Story name="Primary" />
```

### Lit `.stories.ts`

A Lit component registers itself as a browser tag, so the story names that tag rather than a component object, and renders it with Lit's `html`. The component is imported twice on purpose — see the comment in the example.

```ts
import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { html } from 'lit'

// Imported twice on purpose: the first line runs the file, which is what
// registers the tag, and the second gives the story its type. An import used
// only as a type is dropped when the code is built, so without the first line
// the tag would never be registered.
import './ComponentName.lit'
import type { ComponentName } from './ComponentName.lit'

const meta: Meta<ComponentName> = {
	// You can use spaces here to make the title of the story page more human readable
	title: 'Component Name',
	// The tag the component registers itself as, not the class
	component: 'app-component-name',
	// autodocs tag is required
	tags: ['autodocs'],
	parameters: {
		layout: 'padded',
	} satisfies StoryParameters,
	render: (args) => html`
		<app-component-name .text=${args.text}>ComponentName</app-component-name>
	`,
}

export default meta

// Named after the component rather than `typeof meta`: this framework's `Meta`
// and `StoryObj` both take the story's argument type, and neither reads it back
// off the meta object.
type Story = StoryObj<ComponentName>

export const Primary: Story = {
	args: { text: 'ComponentName' },
}
```

The `.lit` in the file name is what `sb-deps` uses to tell a component from any other `.ts` file, set by the `litComponentSuffix` option in `sb-deps.config` — the setup wizard asks for it and writes `'lit'` unless you ask for something else. Only files under your source folder are considered either way. With the option set, that means the ones named `*.lit.ts`; leave it out and it means any plain `.ts` file you create empty, in which case the imports above are `'./ComponentName'`. A `.ts` file that arrives with something already in it is left alone — with no marker its name says nothing about what it is, and creating it empty is the only signal `sb-deps` has that you want it filled in.

Creating the empty story file yourself is how you ask for a story, and what it finds depends on the marker.

With no marker, `helpers.stories.ts` finds `helpers.ts` whatever is in it — that is how you get a story for a file `sb-deps` would otherwise leave alone. A dotted name is the exception and `sb-deps` says nothing about it: `Button.test.stories.ts` writes nothing at all, since `Button.test.ts` is not a component here.

With a marker set, it looks for the marked name and writes one if it is not there. `helpers.stories.ts` gives you a new `helpers.lit.ts` stub and a story for that, and your own `helpers.ts` is neither found nor mentioned — a plain `.ts` file is not a component in that project, so there is no spelling by which it could be found. Rename it to `helpers.lit.ts` if you want it storied.

The `app-` on the tag comes from the `litTagPrefix` option, which defaults to `'app-'`. It is put in front of the component's name in hyphenated form, unless the name already starts with it — so `ComponentName.lit.ts`, `component-name.lit.ts` and `app-component-name.lit.ts` all register `app-component-name`. A browser accepts a tag only when it contains a hyphen, starts with a lower-case letter, and holds nothing outside the characters a tag name allows — the default prefix supplies the first two for even a one-word name. `sb-deps` warns when the tag it works out breaks any of the three, naming which, and writes the file anyway.

Scaffolded Lit components use the shorthand `@customElement` / `@property` annotations, which is what Lit's own TypeScript starter sets up. A project assembled by hand needs the same two settings that starter uses — `"experimentalDecorators": true` and `"useDefineForClassFields": false` — in its `tsconfig.json`. Lit's own documentation is the place to check what a newer TypeScript wants here; this guide only records what the scaffolded component was written against.

### Optional: `__filePath` fallback

The addon matches each docs page to its graph entry by **storyId** — derived at build time from your story file's `title:` literal. For typical projects (literal `title:` string, component file somewhere under your project's source root — `src/` by default, configurable via the [`srcDir`](https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/storybook-addon-package/README.md#srcdir) option) this works without any extra parameter on the story.

If your storyId-based lookup ever fails — for example because the title is computed dynamically and the build-time scanner can't read it, or your file layout doesn't match the conventions above — you can add a `__filePath` parameter as a fallback. The addon will then match the story to its graph entry by source path:

```tsx
parameters: {
	layout: 'padded',
	__filePath: import.meta.url, // Vite gives us the absolute path to this story file
} satisfies StoryParameters,
```

Same shape inside `defineMeta({ ..., parameters: { __filePath: import.meta.url } })` for Svelte CSF.

## 4. `package.json` scripts

The wizard adds these three:

```json
{
	"scripts": {
		"sb": "sb-deps --watch --run-storybook",
		"sb:build": "sb-deps && storybook build",
		"sb:deps": "sb-deps"
	}
}
```

- `npm run sb` — Storybook in watch mode with automatic dependency tracking and story scaffolding.
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

```ts
/// <reference types="vite/client" />

import {
	defaultPreviewParameters,
	dependencyPreviewDecorators,
	type StorybookPreviewConfig,
} from 'storybook-addon-dependency-previews'

// Import the generated dependency-previews.json file
import dependenciesJson from './dependency-previews.json'

// Optional — import your global styles here if you have any
// import '../src/styles.css'

const previewConfig: StorybookPreviewConfig = {
	decorators: [...dependencyPreviewDecorators],
	parameters: {
		...defaultPreviewParameters,
		dependencyPreviews: {
			dependenciesJson,
			storyModules: import.meta.glob(
				'/src/**/*.{story,stories}.{tsx,ts,jsx,js,svelte}',
				{ eager: false },
			),
			// URL to the root of your project inside your git repository — the folder
			// that contains your package.json, NOT the src folder. Component file
			// paths are appended to this URL to build "view source" links, so a
			// monorepo project needs to include its subpath: e.g.
			// 'https://github.com/your-org/your-repo/blob/main/packages/my-app'.
			// The setup wizard auto-detects this from your git remote when available
			// (GitHub, GitLab, Bitbucket, Codeberg/Gitea, SourceHut, Gitee).
			sourceRootUrl: 'https://github.com/your-org/your-repo/blob/main',
			// `import.meta.url` is a Vite-specific feature.
			// Allows opening the component file directly in VS Code when running locally.
			projectRootPath: new URL('..', import.meta.url).pathname,
		},
	},
}

export default previewConfig
```

### Storybook 11 / CSF Next form

From Storybook 11 the default `preview.ts` style is CSF Next — a `definePreview({ ... })` call that takes an `addons` list. Register the addon there by calling `dependencyPreviews()` instead of spreading the parameters and decorators in by hand; the `dependencyPreviews` settings block is the same as above:

```ts
/// <reference types="vite/client" />

import { definePreview } from '@storybook/react-vite' // if using React
import { definePreview } from '@storybook/vue3-vite' // if using Vue 3
import { definePreview } from 'storybook-solidjs-vite' // if using Solid
import { definePreview } from '@storybook/web-components-vite' // if using Lit
import addonDocs from '@storybook/addon-docs'
import { dependencyPreviews } from 'storybook-addon-dependency-previews'

import dependenciesJson from './dependency-previews.json'

export default definePreview({
	// In a CSF Next preview this list is what loads each addon's preview-side
	// setup, so `@storybook/addon-docs` (which this addon renders into) has to
	// be listed here as well — the `addons` list in `main.ts` is not enough.
	addons: [addonDocs(), dependencyPreviews()],
	parameters: {
		dependencyPreviews: {
			dependenciesJson,
			storyModules: import.meta.glob(
				'/src/**/*.{story,stories}.{tsx,ts,jsx,js,svelte}',
				{ eager: false },
			),
			sourceRootUrl: 'https://github.com/your-org/your-repo/blob/main',
			projectRootPath: new URL('..', import.meta.url).pathname,
		},
	},
})
```

`definePreview` comes from your framework package. Not every framework package exports it yet (at the time of writing `@storybook/preact-vite`, `@storybook/sveltekit` and `@storybook/svelte-vite` do not) — for those, keep the hand-spread form. The hand-spread form remains supported on Storybook 11 (checked with the React example site on the 11 alpha). The setup wizard patches whichever form an existing preview file uses, and when it creates the file it writes this form on Storybook 11 for the frameworks listed in the imports above and the hand-spread form everywhere else.

## 7. Run it

```sh
npm run sb
```

As you create new component files the wizard auto-scaffolds matching story files and the dependency-previews JSON updates on the fly.

See the [main README](../README.md) for the optional `sb-deps.config.mjs` configuration file. **Solid and Preact projects:** `sb-deps` works the framework out from your project, so it scaffolds that framework's `.tsx` templates without being told. Setting [`tsxFramework`](../README.md#tsxframework) there says so outright, which is worth doing where your project's framework isn't obvious from its files — React, Solid and Preact all use `.tsx`, so the extension alone can't settle it.
