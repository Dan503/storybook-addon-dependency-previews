# Storybook Add On - Dependency Previews

[![Dependency Previews logo](https://github.com/Dan503/storybook-addon-dependency-previews/raw/main/storybook-addon-package/readme-images/dependency-previews-logo.png)](https://dependency-previews-storybook-react.netlify.app/?path=/docs/04-templates-home-template--docs)

## What is this?

> **This plugin is built for Storybook 10**

A plugin for [Storybook](https://storybook.js.org/) that shows the full dependency tree in both directions (built with and used by) the components in your application.

Currently works with **React**, **Svelte**, **Vue 3**, **Solid**, **Angular**, and **Next.js**. The automated `sb-deps setup` wizard handles Vite-based projects (React, Svelte, Vue 3, Solid) end-to-end. Webpack-based projects (Angular, Next.js) need a one-time manual setup — see the [manual-setup-webpack guide](https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/storybook-addon-package/docs/manual-setup-webpack.md) below.

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

- [Svelte Storybook demo site](https://dependency-previews-storybook-svelte.netlify.app/?path=/docs/04-templates-home-template--docs)
- [Svelte rendered example website](https://dependency-previews-demo-site-svelte.netlify.app/)
- [Svelte demo source code](https://github.com/Dan503/storybook-addon-dependency-previews/tree/main/example-site/svelte)

#### Vue demos

Vue version built for Vue 3.

- [Vue Storybook demo site](https://dependency-previews-storybook-vue.netlify.app/?path=/docs/04-templates-home-template--docs)
- [Vue rendered example website](https://dependency-previews-demo-site-vue.netlify.app/)
- [Vue demo source code](https://github.com/Dan503/storybook-addon-dependency-previews/tree/main/example-site/vue)

#### Solid demos

- [Solid Storybook demo site](https://dependency-previews-storybook-solid.netlify.app/?path=/docs/04-templates-home-template--docs)
- [Solid rendered example website](https://dependency-previews-demo-site-solid.netlify.app/)
- [Solid demo source code](https://github.com/Dan503/storybook-addon-dependency-previews/tree/main/example-site/solid)

#### Angular demos

- [Angular Storybook demo site](https://dependency-previews-storybook-angular.netlify.app/?path=/docs/04-templates-home-template--docs)
- [Angular rendered example website](https://dependency-previews-demo-site-angular.netlify.app/)
- [Angular demo source code](https://github.com/Dan503/storybook-addon-dependency-previews/tree/main/example-site/angular)

<!-- TODO: Provide a video/gif of the addon in action -->

## Installation guide

### Quick start (React, Svelte, Vue 3, and Solid)

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

The wizard supports React (`@storybook/react-vite`), Svelte (`@storybook/sveltekit`, `@storybook/svelte-vite`), Vue 3 (`@storybook/vue3-vite`), and Solid (`storybook-solidjs-vite`) — all Vite-based. **Angular (`@storybook/angular`) and Next.js (`@storybook/nextjs`) projects are both webpack-based and require manual setup** — the wizard's preview-patcher relies on Vite's `import.meta.glob`, which webpack doesn't expose. Follow the matching guide below:

- [Manual setup — Vite (React, Svelte, Vue 3, Solid)](https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/storybook-addon-package/docs/manual-setup-vite.md)
- [Manual setup — webpack (`@storybook/angular`, `@storybook/nextjs`)](https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/storybook-addon-package/docs/manual-setup-webpack.md)

## Auto-scaffolding new components and stories

While `sb-deps` is watching (`npm run sb`), creating an **empty** source file fills it in from a template — and creates its matching sibling too. It works from either side:

- **Create a component file** (`Button.tsx`, `Button.svelte`, `Button.vue`, `Button.component.ts`) → the component body is scaffolded **and** a matching story file is generated next to it.
- **Create a story file** (`Button.stories.tsx`, or the singular `Button.story.tsx`) → the story is scaffolded into that exact file, and if the sibling component doesn't exist yet it is created and scaffolded too.

Either way you end up with a working component + story pair. Only empty files are touched, so existing files are never overwritten. A `.stories.ts` with no component beside it is resolved to React, Solid, Vue, or Angular from your project's framework (Svelte stories use a `.svelte` file, so `.ts` isn't scaffolded for Svelte).

### What the scaffolded components assume

Each generated component is written the way its framework currently recommends, which means some of them assume a fairly recent version of it:

- **Vue 3.5+** — the component gives a prop its default value inside the `defineProps` destructure. Vue only keeps a destructured prop reactive from 3.5, so on an earlier version the component stops updating when a parent changes that prop. The starting value still shows.
- **Svelte 5** — `$props()`, `$state()` and the `Snippet` type.
- **Angular 17.1+** — `input()` signals.

React and Solid add no version floor beyond what the addon itself needs. In a **Next.js** project the React component is written with a `'use client'` line at the top, because it holds state and the App Router renders on the server; you will not see that line in any other React project.

None of this affects the dependency graph or anything else `sb-deps` does — it only describes the starter code it writes, so on an older version replace the generated body with whatever your project uses. Or replace the template outright via [`scaffold`](#scaffold), which is what that option is for.

React and Solid both author components in `.tsx`, so the extension alone can't tell them apart. `sb-deps` works it out from your project, so a Solid project gets Solid templates (`solid-js`, `storybook-solidjs-vite`) without being told; anything it does not read as Solid gets React ones. Set `tsxFramework: 'solid'` in your `sb-deps` config to say so outright — worth doing where your project's framework isn't obvious from its files.

### File names must end in lower case

`sb-deps` matches file endings exactly, so an extension has to be spelled in lower case, and so do the `.stories` and `.story` parts. `Button.stories.tsx` works; `Button.Stories.tsx` and `Button.TSX` do not. Storybook matches its own `stories` setting exactly too, so a story file spelled with capitals would never show up there whatever this tool did with it.

Two more endings are read, but only where they mean anything. `.decorator` is read on `.svelte` files, since only Svelte writes those. `.component` is read on `.ts` and `.html` files **in an Angular project only** — every framework writes `.ts`, so the extension alone can't tell an Angular component from an ordinary dotted name. Anywhere else the two mean nothing here: a NestJS `Roles.Decorator.ts`, or an `Auth.Component.ts` in a React project, is left alone.

Create a file with a capitalised ending and `sb-deps` says so, names the spelling to rename it to, and writes nothing for it.

It checks files as they are created, which includes ones a branch checkout or a copy brings in while it is running — those arrive as creations like any other and are turned away the same way. What it cannot see is a file that appeared while it was not running, or one already in your project before you installed the addon. Nothing breaks: such a file simply won't be paired with its story until you rename it.

On Linux and other systems that tell capitals apart, four spellings go unnoticed entirely — the patterns the watcher listens on match exactly there, and these match none of them, so they are neither refused nor mentioned. Nothing breaks that renaming won't fix; there is just nothing telling you to rename them. On Windows and macOS all four are caught as usual:

- **Angular templates** — `Button.Component.html`.
- **A capitalised extension** — `Gadget.TSX`.
- **A story outside your source folder** — `stories/Foo.Stories.tsx`.
- **A capitalised story ending on `.mdx`** — `Foo.Stories.mdx`.

The last two have perfectly ordinary extensions; it is the `.Stories` part carrying the capitals.

The watcher's patterns can't be widened *across the board* to catch these: on those same systems, matching every pattern loosely would also make a `Src/` folder match a `srcDir` of `src`, and there those really are two different folders.

Only the endings are checked, so a component whose own name carries a dot is left alone — as long as none of its dotted parts is an ending that means something here, on that extension and in that framework. `Table.Row.tsx` is fine; `My.Story.tsx` is read as a story file and refused.

A story and its component also have to agree on capitals. Creating `cardlisting.stories.tsx` next to an existing `CardListing.tsx` is reported rather than guessed at: on Windows and macOS the two names open the same file and elsewhere they don't, so there is no reading of it that works everywhere.

A Svelte decorator is the one exception — it is reported but still written. Creating `cardlisting.decorator.svelte` next to `CardListing.svelte` writes the decorator with an import that works on Windows and macOS and fails elsewhere, and says so.

The difference is that a refused decorator would be stuck, while a refused story isn't. An empty story file gets filled later — once you fix the clash, creating the component writes into the empty story that is already there. A decorator has no second file whose creation comes back for it, so refusing would leave you one that only deleting and re-creating could ever fill.

### File names must be able to become component names

The name of a file is what the templates put in front of `export function`, in the props type name, and in the import the story writes — so a file whose name can't be used that way can't be scaffolded from. Creating one is reported and nothing is written for it:

```
[sb-deps] left "src/routes/[category].tsx" alone — "[category]" can't be used as a component name in the generated code, so nothing was scaffolded for it.
```

Router page files are the usual reason. `[category].tsx` is how Solid Start, SvelteKit and Next.js App Router name a page with a changing part of its address, SvelteKit also writes `+page.svelte` and `+layout.svelte`, and a name that starts with a digit (`2-column.tsx`) can't be a function name either.

Only files the scaffolder would otherwise have acted on are checked, so a plain `.ts` file such as SvelteKit's `+page.server.ts` is never mentioned — no component or story was ever going to come of it.

If a whole folder of these is expected — which it is, for any project with a router — [`scaffoldIgnore`](#scaffoldignore) turns the messages off along with the scaffolding.

**Tip — if a brand-new story shows `importers[path] is not a function` in Storybook**, just reload the browser tab. This is an occasional Storybook dev-server timing quirk when a story file is added while the dev server is running (the preview's internal module map briefly lags behind); a refresh clears it and the scaffolded files themselves are correct. Creating the **component** first (and letting the story auto-generate) avoids the hiccup entirely.

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

### `storybookFileExtension`

The extension `sb-deps` uses when it auto-scaffolds a story file for a new component — `'stories'` (Storybook's convention) or `'story'`. The setup wizard asks for this preference.

**Default:** `'stories'`

| Value                | Generated story file |
| -------------------- | -------------------- |
| `'stories'` (default) | `ButtonAtom.stories.tsx` |
| `'story'`             | `ButtonAtom.story.tsx`   |

```js
// sb-deps.config.mjs
import { defineSbDepsConfig } from 'storybook-addon-dependency-previews/config'

export default defineSbDepsConfig({
	storybookFileExtension: 'story',
})
```

### `tsxFramework`

Which flavor to scaffold for `.tsx` component and story files — `'react'` or `'solid'`. React and Solid both author components in `.tsx`, so the extension alone can't tell them apart; set this to `'solid'` in a Solid project and scaffolded `.tsx` files get Solid templates (`solid-js` `createSignal`/`mergeProps`, `storybook-solidjs-vite` story imports) instead of React. The setup wizard sets it for you when it detects a Solid project. Per-template overrides for Solid go under [`scaffold.solid`](#scaffold).

**Default:** `'solid'` when `sb-deps` detects a Solid project, `'react'` otherwise — so a Solid project gets Solid templates without the key being set. Setting the key is worth it where the framework isn't obvious from your project's files.

```js
// sb-deps.config.mjs
import { defineSbDepsConfig } from 'storybook-addon-dependency-previews/config'

export default defineSbDepsConfig({
	tsxFramework: 'solid',
})
```

### `scaffoldIgnore`

Paths the scaffolder leaves alone. Each entry is a path pattern matched against a file's path from your project root, written with forward slashes.

**Default:** `[]` (nothing is left alone)

A file matching one of the patterns gets nothing written into it, gets no story beside it, and is never mentioned by the two naming checks above — those messages exist only to explain why nothing was scaffolded, so they have nothing to say about a file the tool was told to leave alone.

Matching files **still appear in the dependency graph**, so a page still shows what it is built with. This option is about scaffolding, not about hiding files.

A router folder is the usual reason to set it. A page takes no props, so the story generated for one has nothing to show — and page names like `[category].tsx` or `+page.svelte` can't be scaffolded from at all.

```js
// sb-deps.config.mjs
import { defineSbDepsConfig } from 'storybook-addon-dependency-previews/config'

export default defineSbDepsConfig({
	scaffoldIgnore: ['src/routes/**'],
})
```

| Pattern           | Matches                                         |
| ----------------- | ----------------------------------------------- |
| `'src/routes/**'` | Everything under that one folder                |
| `'**/routes/**'`  | Everything under a `routes` folder at any depth |
| `'src/pages/**'`  | Everything under `src/pages`                    |
| `'**/*.page.tsx'` | Files named that way, wherever they are         |

Patterns are read by [`micromatch`](https://github.com/micromatch/micromatch), the same matcher the watcher uses for its own file patterns, so anything it understands works here.

On Windows and macOS the **whole path** is matched ignoring capitals — the file name as well as the folders. So `'src/routes/**'` covers a `Src/Routes` folder on disk, and `'**/*.page.tsx'` also covers `Foo.Page.tsx`. That is wider than the rest of the tool, which matches file endings exactly; the difference is deliberate, since these patterns are yours rather than something the tool infers. On Linux every pattern is matched exactly.

A story file is checked against its component, not only against itself, and a component is checked against the story name it would be given. A folder pattern covers both, since a story always sits beside its component — the difference only shows with a pattern naming files. With `'**/*.page.tsx'`, creating `Foo.page.stories.tsx` by hand leaves that story empty rather than filling it, because the component it belongs to is one you asked to be left alone. With `'**/*.stories.tsx'`, creating `Foo.tsx` scaffolds the component but writes no story. Either way the reason is printed.

An entry that isn't a non-empty string makes the whole option invalid — the CLI says so and carries on with no patterns, rather than applying half the list.

### `scaffold`

Override the templates used when `sb-deps` auto-scaffolds new component and story files. Each template function receives a context object with relevant variables and must return the full file content as a string.

For `.tsx` files the override key follows [`tsxFramework`](#tsxframework): a React project reads `scaffold.react`, a Solid project reads `scaffold.solid` — overrides placed under the wrong key are silently ignored.

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
			/**
			 * Customize the generated .decorator.svelte file.
			 * Import the wrapped component from `componentImportPath` rather than
			 * building the path out of `componentName` — that is the name the
			 * import binds to, and it can differ from the file
			 * (`card-listing.svelte` binds as `CardListing`).
			 */
			decorator: ({ componentName, componentImportPath }) => '...',
			/** Customize the generated .stories.svelte file */
			story: ({ componentName, title, tags }) => '...',
		},
		vue: {
			/** Customize the generated .vue component file */
			component: ({ componentName }) => '...',
			/** Customize the generated .stories.ts file */
			story: ({ componentName, title, tags }) => '...',
		},
		solid: {
			/** Customize the generated .tsx component file */
			component: ({ componentName, propsName }) => '...',
			/** Customize the generated .stories.tsx file */
			story: ({ componentName, propsName, title, tags, base }) => '...',
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
