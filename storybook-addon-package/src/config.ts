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
	 * projects that lay out their source under a non-standard root.
	 *
	 * Drives the postprocess filter that decides which modules survive into
	 * `.storybook/dependency-previews.json`, the `dep-cruiser` `--include-only`
	 * flag, the file-watcher globs in watch mode, and the source-root paths
	 * used by the component / story scaffolders.
	 *
	 * **Non-`src` layouts also need to override the bundled `depcruise.config.ts`.**
	 * The bundled `forbidden` rules (`no-node-modules-imports`,
	 * `no-orphans-in-components`) hardcode `^src` in their `path` matchers, so
	 * the rules won't fire on a non-`src` tree. Drop your own
	 * `depcruise.config.cjs` (or `.dependency-cruiser.{js,cjs}`) in the project
	 * root to take full control — the CLI picks up project-root overrides
	 * automatically.
	 *
	 * Must be a single path segment (no slashes). The leading segment of every
	 * key in `dependency-previews.json` will match this value.
	 *
	 * @example 'src'   (default)
	 * @example 'app'
	 * @example 'source'
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
