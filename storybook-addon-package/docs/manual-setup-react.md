# Manual setup — React

> **Tip:** for most React projects you can use the automated wizard instead:
> ```sh
> npx sb-deps setup
> ```
>
> The steps below describe what the wizard does, in case you'd rather configure things by hand or the wizard couldn't recognise your existing config.

## 1. Install the addon

```sh
npm install -D storybook-addon-dependency-previews dependency-cruiser
```

<details>
	<summary>Other package managers</summary>
	<p><pre><code>pnpm add -D storybook-addon-dependency-previews dependency-cruiser</code></pre></p>
	<p><pre><code>yarn add -D storybook-addon-dependency-previews dependency-cruiser</code></pre></p>
	<p><pre><code>bun add -D storybook-addon-dependency-previews dependency-cruiser</code></pre></p>
</details>

## 2. Register the addon in `.storybook/main.ts`

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

## 3. Bare-minimum `.stories.tsx` example

```ts
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
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
	// `satisfies StoryParameters` gives you type safety and autocomplete on the parameters object
	parameters: {
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {},
}
```

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

// Global styles are imported here (optional)
import '../src/styles.css'

const previewConfig: StorybookPreviewConfig = {
	decorators: [...dependencyPreviewDecorators],
	parameters: {
		...defaultPreviewParameters,
		dependencyPreviews: {
			dependenciesJson,
			storyModules: import.meta.glob(
				'/src/**/*.stories.@(tsx|ts|jsx|js)',
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
