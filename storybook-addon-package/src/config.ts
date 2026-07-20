export interface ReactComponentScaffoldContext {
	/** PascalCase component name, e.g. `"ButtonAtom"` */
	componentName: string
	/** Props interface name, e.g. `"PropsForButtonAtom"` */
	propsName: string
}

export interface ReactStoryScaffoldContext extends ReactComponentScaffoldContext {
	/** Storybook story title, e.g. `"Atoms / Button Atom"` */
	title: string
	/** Story tags, e.g. `["autodocs", "atom"]` */
	tags: string[]
	/** Base file name without extension, e.g. `"ButtonAtom"` */
	base: string
}

export interface SvelteComponentScaffoldContext {
	/** PascalCase component name, e.g. `"ButtonAtom"` */
	componentName: string
}

export interface SvelteStoryScaffoldContext extends SvelteComponentScaffoldContext {
	/** Storybook story title, e.g. `"Atoms / Button Atom"` */
	title: string
	/** Story tags, e.g. `["autodocs", "atom"]` */
	tags: string[]
}

export interface VueComponentScaffoldContext {
	/** PascalCase component name, e.g. `"ButtonAtom"` */
	componentName: string
}

export interface VueStoryScaffoldContext extends VueComponentScaffoldContext {
	/** Storybook story title, e.g. `"Atoms / Button Atom"` */
	title: string
	/** Story tags, e.g. `["autodocs", "atom"]` */
	tags: string[]
}

export interface SolidComponentScaffoldContext {
	/** PascalCase component name, e.g. `"ButtonAtom"` */
	componentName: string
	/** Props interface name, e.g. `"PropsForButtonAtom"` */
	propsName: string
}

export interface SolidStoryScaffoldContext extends SolidComponentScaffoldContext {
	/** Storybook story title, e.g. `"Atoms / Button Atom"` */
	title: string
	/** Story tags, e.g. `["autodocs", "atom"]` */
	tags: string[]
	/** Base file name without extension, e.g. `"ButtonAtom"` */
	base: string
}

export interface SvelteDecoratorScaffoldContext {
	/**
	 * PascalCase name of the **wrapped** component (the segment of the
	 * decorator filename before the first `.`, then PascalCased).
	 *
	 * Examples:
	 * - `Button.decorator.svelte` → `"Button"`
	 * - `Button.Primary.decorator.svelte` → `"Button"`
	 * - `card-listing.Error.decorator.svelte` → `"CardListing"`
	 */
	componentName: string
}

export interface AngularBaseScaffoldContext {
	/** PascalCase component name, e.g. `"ButtonAtom"` */
	componentName: string
	/** Angular class name, e.g. `"ButtonAtomComponent"` */
	className: string
	/** Base file name without extension, e.g. `"button-atom"` */
	base: string
}

export interface AngularComponentScaffoldContext extends AngularBaseScaffoldContext {
	/** Angular element selector, e.g. `"app-button-atom"` */
	selector: string
	/** Whether the component places the HTML template inside the component TS file (`"internal"`) or uses an external HTML file (`"external"`) */
	templateLocation: 'internal' | 'external'
}

export interface AngularComponentHtmlScaffoldContext {
	/** PascalCase component name, e.g. `"ButtonAtom"` */
	componentName: string
}

export interface AngularStoryScaffoldContext extends AngularBaseScaffoldContext {
	/** Storybook story title, e.g. `"Atoms / Button Atom"` */
	title: string
	/** Story tags, e.g. `["autodocs", "atom"]` */
	tags: string[]
}

export interface SbDepsConfig {
	/**
	 * Top-level source directory (relative to the project root) where your
	 * component source lives. Defaults to `'src'`. Set to e.g. `'app'` for
	 * projects that lay out their source under a non-standard root (common
	 * for Next.js App Router projects with no `src/` folder), or to the empty
	 * string `''` to use the project root itself as the source folder.
	 *
	 * Drives the postprocess filter that decides which modules survive into
	 * `.storybook/dependency-previews.json`, the `dep-cruiser` `--include-only`
	 * flag, the file-watcher globs in watch mode, the source-root paths used
	 * by the component / story scaffolders, and the bundled depcruise
	 * config's rule `path` matchers (passed through `SB_DEPS_SRC_DIR` env so
	 * `^src/` rebuilds to `^<srcDir>/` automatically — anchored to a
	 * directory boundary so a srcDir of `src` doesn't also match sibling
	 * folders like `src2/`).
	 *
	 * When set to `''`, dep-cruiser's `--include-only` regex switches to a
	 * node_modules denylist that rejects `node_modules` as any path segment
	 * (top-level or nested under workspace packages), so the scan doesn't
	 * dive into `node_modules` even in monorepos. Very large monorepos may
	 * still want to set an explicit folder to keep the scan tight.
	 *
	 * Must be either the empty string, or a single path segment containing
	 * only alphanumerics, `.`, `_`, or `-` — `src`, `app`, `my-source`,
	 * `app.v2`, `''` are fine; anything with path separators, glob
	 * metacharacters (`*`, `?`, `[`, `]`, `{`, `}`), or shell metacharacters
	 * (`%`, `^`, `&`, `|`, `<`, `>`, `(`, `)`, `!`) is rejected at load time
	 * with a warning + fallback to `'src'`. With a non-empty value, every key
	 * in `dependency-previews.json` starts with `<srcDir>/`. With `''`, keys
	 * are still project-relative paths (e.g. `components/Foo.tsx`,
	 * `packages/foo/Bar.tsx`) — there's just no fixed `srcDir` prefix
	 * constraining which top-level folders appear.
	 *
	 * @example 'src'   (default)
	 * @example 'app'
	 * @example 'source'
	 * @example ''      (project root is the source folder)
	 */
	srcDir?: string

	/**
	 * Prefix prepended to Angular component selectors.
	 * Defaults to `'app-'`. Set to `''` for no prefix.
	 * @example 'app-'  →  selector: 'app-button-atom'
	 * @example 'my-'   →  selector: 'my-button-atom'
	 * @example ''      →  selector: 'button-atom'
	 */
	angularSelectorPrefix?: string

	/**
	 * Which flavor to scaffold for `.tsx` component and story files. Defaults
	 * to `'react'`.
	 *
	 * React and Solid both author components in `.tsx`, so the file extension
	 * alone can't tell them apart. Set this to `'solid'` in a Solid project so
	 * the watch-mode scaffolder emits Solid templates (`createSignal`,
	 * `mergeProps`, `storybook-solidjs-vite` story imports) instead of React
	 * ones. The `sb-deps setup` wizard writes this automatically for detected
	 * Solid projects.
	 *
	 * @example 'react'  (default)
	 * @example 'solid'
	 */
	tsxFramework?: 'react' | 'solid'

	/**
	 * Extension used when the scaffolder generates a story file for a new
	 * component. `'stories'` → `Foo.stories.tsx` (Storybook's convention, the
	 * default); `'story'` → `Foo.story.tsx`. The setup wizard asks for this
	 * preference and persists a non-default choice.
	 * @default 'stories'
	 */
	storybookFileExtension?: 'story' | 'stories'

	/**
	 * Customize the scaffold templates used when new component or story files are created.
	 * Each function receives a context object with relevant variables and must return the
	 * full file content as a string.
	 *
	 * @example
	 * ```js
	 * // sb-deps.config.js
	 * export default defineSbDepsConfig({
	 *   scaffold: {
	 *     react: {
	 *       component: ({ componentName, propsName }) => `
	 * export interface ${propsName} {}
	 * export function ${componentName}({}: ${propsName}) {
	 *   return <div>${componentName}</div>
	 * }
	 * `.trimStart(),
	 *     },
	 *   },
	 * })
	 * ```
	 */
	scaffold?: {
		react?: {
			/** Template for the `.tsx` component file */
			component?: (ctx: ReactComponentScaffoldContext) => string
			/** Template for the `.stories.tsx` story file */
			story?: (ctx: ReactStoryScaffoldContext) => string
		}
		svelte?: {
			/** Template for the `.svelte` component file */
			component?: (ctx: SvelteComponentScaffoldContext) => string
			/** Template for the `.decorator.svelte` decorator file */
			decorator?: (ctx: SvelteDecoratorScaffoldContext) => string
			/** Template for the `.stories.svelte` story file */
			story?: (ctx: SvelteStoryScaffoldContext) => string
		}
		vue?: {
			/** Template for the `.vue` component file */
			component?: (ctx: VueComponentScaffoldContext) => string
			/** Template for the `.stories.ts` story file */
			story?: (ctx: VueStoryScaffoldContext) => string
		}
		solid?: {
			/** Template for the `.tsx` component file (Solid projects) */
			component?: (ctx: SolidComponentScaffoldContext) => string
			/** Template for the `.stories.tsx` story file (Solid projects) */
			story?: (ctx: SolidStoryScaffoldContext) => string
		}
		angular?: {
			/** Template for the `.component.ts` file */
			component?: (ctx: AngularComponentScaffoldContext) => string
			/** Template for the `.component.html` file (external template style only) */
			componentHtml?: (ctx: AngularComponentHtmlScaffoldContext) => string
			/** Template for the `.stories.ts` story file */
			story?: (ctx: AngularStoryScaffoldContext) => string
		}
	}
}

export function defineSbDepsConfig(config: SbDepsConfig): SbDepsConfig {
	return config
}
