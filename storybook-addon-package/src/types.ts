import type { ComponentType, ReactNode } from 'react'
import type {
	ProjectAnnotations,
	Renderer,
	StoryContext,
} from 'storybook/internal/types'

export type StorybookParameters = ProjectAnnotations<Renderer>['parameters']

export type StoryModules = Record<string, () => Promise<unknown>>

type LayoutOptions = 'padded' | 'centered' | 'fullscreen'

export type StoryParameters = StorybookParameters & {
	/**
	 * Determine how the component is displayed in the preview area.
	 *
	 * Options are:
	 * - `'padded'` - adds padding around the component in the preview area (good for most components)
	 * - `'centered'` - centers the component in the preview area (good for small components like buttons and icons)
	 * - `'fullscreen'` - makes the component take up the entire preview area (good for components that take up the entire screen like pages and modals)
	 *
	 * @default 'padded'
	 */
	layout?: LayoutOptions
	/**
	 * A required property in all component story files. This is used to determine the path to the story.
	 *
	 * Use the following as the value for this property:
	 *
	 * ```ts
	 * import.meta.url
	 * ```
	 */
	__filePath: string
}

export type DependencyPreviewStorybookParameters = Omit<
	StoryParameters,
	'__filePath'
> & {
	/** Preview settings used by the dependency-previews storybook add-on */
	dependencyPreviews: {
		/**
		 * A mapping of story module importers, used to dynamically load story modules in the preview area.
		 *
		 * Use the following as the value for this property:
		 * ```ts
		 * import.meta.glob('/src/**\/*.stories.@(tsx|ts|jsx|js|svelte)', { eager: false });
		 * ``` */
		storyModules: StoryModules
		/**
		 * Point to the root folder of your project source control.
		 *
		 * This allows the addon to link to the source code of your components.
		 *
		 * @example "https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/example-site"
		 */
		sourceRootUrl: string
		/**
		 * Specify the absolute path of the root folder of your project source code.
		 * This is used to open files in VS Code from the Storybook UI.
		 *
		 * @example "C:/Users/your-user-name/projects/your-project-name"
		 *
		 * // If you are using Vite, and the config you are writing is stored in the `.storybook` folder, you can use:
		 *
		 * @example new URL('..', import.meta.url).pathname
		 */
		projectRootPath: string
		/**
		 * The imported dependency-previews.json file.
		 *
		 * You will need to set `"resolveJsonModule"` to `true` in tsConfig.json to import this file.
		 */
		dependenciesJson: Graph
	}
}

export type StorybookPreviewConfig = ProjectAnnotations<Renderer> & {
	parameters: DependencyPreviewStorybookParameters
}

export type Graph = Record<string, Deps>

export interface Deps extends StoryInfo {
	builtWith: Array<StoryInfo>
	usedIn: Array<StoryInfo>
}

export interface StoryInfo {
	componentPath: string
	storyId?: string | null
	storyTitle?: string | null
	storyTitlePath?: string | null
	storyFilePath?: string | null
}

export type CsfModule = {
	default?: {
		title?: string
		component?: ComponentType<any>
		args?: AnyObj
		parameters?: AnyObj
		decorators?: DecoratorFn[]
	}
	__namedExportsOrder?: string[]
	[k: string]: any // named story exports
}

export type AnyObj = Record<string, any>
export type StoryExport =
	| ((args: AnyObj, context?: StoryContext) => ReactNode) // function story
	| {
			render?: (args: AnyObj, context?: StoryContext) => ReactNode
			args?: AnyObj
			decorators?: DecoratorFn[]
	  }

export type DecoratorFn = (
	Story: (ctx: StoryContext) => ReactNode,
	ctx: StoryContext,
) => ReactNode

// Angular utility — uses a structural match for InputSignal<T> so the addon
// does not need a hard dependency on @angular/core.
// T[K] extends () => infer U matches InputSignal (and ModelSignal) because
// Angular signals are callable getters. Note: this also captures other zero-arg
// callable properties (computed signals, plain methods) — use ExcludeKeys to
// omit anything that isn't a true input prop (e.g. 'class', lifecycle hooks).
type _InputSignalValue<T> = T extends () => infer U ? U : never
type _InputSignalKeys<T> = {
	[K in keyof T]: T[K] extends () => unknown ? K : never
}[keyof T]

/**
 * Extracts plain prop types from an Angular component's signal-based inputs.
 *
 * Uses a structural match (`() => unknown`) to identify callable properties,
 * which covers `input()` and `model()` signals but will also match computed
 * signals and zero-arg methods. Use `ExcludeKeys` to omit any non-input
 * properties (e.g. `'class'`, lifecycle hooks).
 *
 * @example
 * export type PropsForCardMolecule = AngularComponentProps<CardMoleculeComponent, 'class'>
 * // → { title: string; href: string; description: string; imgSrc: string }
 */
export type AngularComponentProps<T, ExcludeKeys extends keyof T = never> = {
	[K in Exclude<_InputSignalKeys<T>, ExcludeKeys>]: _InputSignalValue<T[K]>
}
