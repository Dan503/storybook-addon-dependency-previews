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
