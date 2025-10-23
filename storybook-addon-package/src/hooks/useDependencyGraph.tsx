import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { Deps, Graph, StoryInfo } from '../types'
import { useStoryParams } from './useStoryParams'

export interface DependencyGraphContextType {
	graph: Graph | null
	node: Deps | null
}

export const DependencyGraphContext = createContext<DependencyGraphContextType>(
	{
		graph: null,
		node: null,
	},
)

export function useDependencyGraph() {
	return useContext(DependencyGraphContext)
}

export function DependencyGraphProvider({ children }: { children: ReactNode }) {
	const storyParams = useStoryParams()
	const filePath = storyParams?.__filePath
	const refinedFilePath = filePath
		?.replace(/^.+\/src\//, 'src/') // remove host from the path
		.replace('.stories.', '.') // remove .stories extension
		.replace('.story.', '.') // remove .story extension
		.replace(/\?.+$/, '') // remove any query string parameters

	const graph = storyParams.dependencyPreviews.dependenciesJson

	const node = useMemo(
		() => graph?.[refinedFilePath!]!,
		[graph, refinedFilePath],
	)

	return (
		<DependencyGraphContext.Provider
			value={{
				graph,
				node,
			}}
		>
			{children}
		</DependencyGraphContext.Provider>
	)
}

export function filterOutStoryAndNonComponentFiles(
	array: Array<StoryInfo>,
): Array<StoryInfo> {
	return array.filter((info) => {
		return (
			Boolean(info.storyId) &&
			!info.componentPath.includes('.stories.') &&
			!info.componentPath.includes('.story.')
		)
	})
}
