import type {
	ProjectAnnotations,
	Renderer,
	StoryContext,
} from '@storybook/types'
import type { ComponentType, ReactNode } from 'react'

export type StorybookParameters = ProjectAnnotations<Renderer>['parameters']

export type StoryModules = Record<string, () => Promise<unknown>>

export type DependencyPreviewStorybookParameters = StorybookParameters & {
	layout: 'centered' | 'padded' | 'fullscreen'
	/**
	 * A required property in all component story files. This is used to determine the path to the story.
	 *
	 * Use the following as the value for this property:
	 *
	 * ```ts
	 * import.meta.url
	 * ```
	 */
	__filePath?: string
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
		sourceBaseUrl: string
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
