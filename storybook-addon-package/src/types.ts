import type { StoryContext } from '@storybook/types'
import type { ComponentType, ReactNode } from 'react'

export type Graph = Record<string, Deps>

export interface Deps extends StoryInfo {
	builtWith: Array<StoryInfo>
	usedIn: Array<StoryInfo>
}

export interface StoryInfo {
	componentPath: string
	storyId?: string | null
	storyTitle?: string | null
	storyPath?: string | null
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
