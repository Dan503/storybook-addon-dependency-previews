# Storybook Add On - Dependency Previews

## What is this?

A plugin for [Storybook](https://storybook.js.org/) that shows the full dependency tree in both directions (built with and used by) the components in your application.

<!-- TODO: Provide a video/gif of the addon in action -->

## Installation guide

### Package download

First you will need to install the plugin via npm

```
npm install storybook-addon-dependency-previews
```

<details>
	<summary>Other package managers</summary>
	<p><pre><code>pnpm add storybook-addon-dependency-previews</code></pre></p>
	<p><pre><code>yarn add storybook-addon-dependency-previews</code></pre></p>
	<p><pre><code>bun add storybook-addon-dependency-previews</code></pre></p>
	<p><pre><code>deno add npm:storybook-addon-dependency-previews</code></pre></p>
</details>

### Register the add-on

From your root folder, open your `.storybook/main.ts` file.

Edit the `main.ts` to contain the following values or copy/paste the below to replace the full contents of the main.ts file.

```ts
import { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
	// tells storybook what files to look for when it goes searching for story files
	stories: ['../src/**/*.stories.@(ts|tsx|mdx|svelte|vue)'],
	addons: [
		// autodocs is required for this addon to work
		'@storybook/addon-docs',
		// the storybook dependency previews addon registration
		'storybook-addon-dependency-previews/addon',
	],
	framework: {
		// The framework that storybook uses to read story components
		// Use @storybook/*-vite for your framework of choice
		name: '@storybook/react-vite',
		options: {},
	},
}

export default config
```

### Bare minimum storybook story example

Get a story ready so you have something to test with.

Below is the bare minimum needed to generate a viable story that is compatible with the add-on.

```ts
import type { Meta } from '@storybook/react-vite'
import { ComponentName } from './ComponentName'

const meta: Meta<typeof ComponentName> = {
	// You can use spaces here to make the title of the story page more human readable
	title: 'Component Name',
	component: ComponentName,
	// autodocs tag is required
	tags: ['autodocs'],
	// The `__filePath` property must be applied to every story file
	// for the addon to track dependencies effectively
	// They are all given the same `import.meta.url` value
	parameters: {
		__filePath: import.meta.url,
	},
}

export default meta

export const Default = {
	args: {},
}
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

### Create the preview.tsx file

First run `npm run sb:deps` to generate a fresh `dependency-previews.json` file in the `.storybook` folder.

Make sure that the `"resolveJsonModule"` tsConfig.json setting is set to `true` to import this file.

Now create a `preview.tsx` file in the `.storybook` folder with the following content:

```tsx
/// <reference types="vite/client" />

import * as React from 'react'
import {
	defaultPreviewParameters,
	dependencyPreviewDecorators,
	type StorybookPreviewConfig,
} from 'storybook-addon-dependency-previews'

// Import the generated dependency-previews.json file
import dependenciesJson from './dependency-previews.json'

// Global styles are imported here
import '../src/styles.css'

const previewConfig: StorybookPreviewConfig = {
	decorators: [
		...dependencyPreviewDecorators,
	],
	parameters: {
		...defaultPreviewParameters,
		dependencyPreviews: {
			dependenciesJson,
			storyModules: import.meta.glob(
				'/src/**/*.stories.@(tsx|ts|jsx|js|svelte)',
				{ eager: false },
			),
			// Replace this with the base url of your git repository
			// This enables the addon to link to the source code of the component
			sourceBaseUrl:
				'https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/example-site',
		},
	},
}

export default previewConfig
```

### Run it!

You should be all set now.

Try running `npm run sb` to boot up storybook, leave it running as you work.

As you create and delete story files, `sb-deps` will detect when new stories are created/deleted and automatically regenerate the dependency-previews.json for you.

`sb-deps` also auto-scaffolds any new story files that you create so the workflow is:

1. Create draft component
2. Create component story file (sb-deps will auto-scaffold it with boiler plate immediately upon file creation)

This workflow allows you to focus on what matters instead of having to waste time writing lots of boilerplate code.
