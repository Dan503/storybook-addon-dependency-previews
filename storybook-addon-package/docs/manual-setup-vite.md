# Manual setup — Vite (React, Svelte)

> **Tip:** for most Vite-based projects you can use the automated wizard instead:
> ```sh
> npx --package storybook-addon-dependency-previews sb-deps setup
> ```
>
> The steps below describe what the wizard does, in case you'd rather configure things by hand or the wizard couldn't recognise your existing config.
>
> The same instructions cover all currently-supported Vite-based Storybook frameworks (React, Svelte with SvelteKit, vanilla Svelte). Anywhere they diverge, both/all options are inlined into the same code block with `// if using React` / `// if using Svelte` comments — **pick one of each pair when you copy/paste**. Step 3 (the story example) is the one place where React's `.stories.tsx` and Svelte CSF's `.stories.svelte` are too different to inline, so it has separate code blocks.

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
import type { StorybookConfig } from '@storybook/react-vite'   // if using React
import type { StorybookConfig } from '@storybook/sveltekit'    // if using Svelte (SvelteKit)
import type { StorybookConfig } from '@storybook/svelte-vite'  // if using Svelte (without SvelteKit)

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.@(ts|tsx|mdx)'],                       // if using React
	stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|ts|svelte)'],  // if using Svelte
	addons: [
		// autodocs is required for this addon to work
		'@storybook/addon-docs',
		// required for .stories.svelte CSF format (Svelte projects only — delete if using React)
		'@storybook/addon-svelte-csf',
		// the storybook dependency previews addon registration
		'storybook-addon-dependency-previews/addon',
	],
	framework: { name: '@storybook/react-vite', options: {} }, // if using React
	framework: '@storybook/sveltekit',                          // if using Svelte (SvelteKit)
	framework: '@storybook/svelte-vite',                        // if using Svelte (without SvelteKit)
}

export default config
```

## 3. Bare-minimum story example

The React and Svelte story formats are different enough that inlining them isn't useful — pick the section matching your framework.

### React `.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ComponentName } from './ComponentName'

const meta: Meta<typeof ComponentName> = {
	// You can use spaces here to make the title of the story page more human readable
	title: 'Component Name',
	component: ComponentName,
	// autodocs tag is required
	tags: ['autodocs'],
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
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import ComponentName from './ComponentName.svelte'

	const { Story } = defineMeta({
		title: 'Component Name',
		component: ComponentName,
		// autodocs tag is required
		tags: ['autodocs'],
	})
</script>

<Story name="Primary" />
```

### Optional: `__filePath` fallback

The addon matches each docs page to its graph entry by **storyId** — derived at build time from your story file's `title:` literal. For typical projects (literal `title:` string, component file under `src/components|ui|lib/`) this works without any extra parameter on the story.

If your storyId-based lookup ever fails — for example because the title is computed dynamically and the build-time scanner can't read it, or your file layout doesn't match the conventions above — you can add a `__filePath` parameter as a fallback. The addon will then match the story to its graph entry by source path:

```tsx
import type { StoryParameters } from 'storybook-addon-dependency-previews'

const meta: Meta<typeof ComponentName> = {
	title: 'Component Name',
	component: ComponentName,
	tags: ['autodocs'],
	parameters: {
		__filePath: import.meta.url, // Vite gives us the absolute path to this story file
	} satisfies StoryParameters,
}
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
				'/src/**/*.stories.@(tsx|ts|jsx|js)', // if using React
				'/src/**/*.stories.@(ts|js|svelte)',  // if using Svelte
				{ eager: false },
			),
			// Replace this with the URL to your src folder in your git repository.
			// This enables the addon to link to the source code of the component.
			sourceRootUrl:
				'https://github.com/your-org/your-repo/blob/main/src',
			// `import.meta.url` is a Vite-specific feature.
			// Allows opening the component file directly in VS Code when running locally.
			projectRootPath: new URL('..', import.meta.url).pathname,
		},
	},
}

export default previewConfig
```

## 7. Run it

```sh
npm run sb
```

As you create new component files the wizard auto-scaffolds matching story files and the dependency-previews JSON updates on the fly.

See the [main README](../README.md) for the optional `sb-deps.config.mjs` configuration file.
