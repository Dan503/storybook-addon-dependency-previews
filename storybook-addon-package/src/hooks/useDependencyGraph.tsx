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

	const graph = storyParams.dependencyPreviews?.dependenciesJson
	const currentStoryId = storyParams._storyId

	// Build a lookup map from storyId to graph entry
	const storyIdToNode = useMemo(() => {
		if (!graph) return null
		const map: Record<string, Deps> = {}
		for (const [_path, deps] of Object.entries(graph)) {
			if (deps.storyId) {
				map[deps.storyId] = deps
			}
		}
		return map
	}, [graph])

	const node = useMemo((): Deps | null => {
		if (!graph) {
			return null
		}

		// Try multiple lookup strategies:
		// 1. By storyId (most reliable in production)
		// 2. By refined file path (works in dev with import.meta.url)

		// The dependency graph stores --docs story IDs, but users may be viewing
		// individual story variants (e.g., --primary, --secondary).
		// Normalize by converting the current storyId to its --docs variant.
		const docsStoryId = currentStoryId
			? currentStoryId.replace(/--[^-]+$/, '--docs')
			: null

		const byStoryId =
			docsStoryId && storyIdToNode?.[docsStoryId]
				? storyIdToNode[docsStoryId]
				: null
		const byPath = refinedFilePath ? graph[refinedFilePath] : null

		const result = byStoryId ?? byPath ?? null

		return result
	}, [graph, storyIdToNode, currentStoryId, refinedFilePath])

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
