import React, {
	createContext,
	useContext,
	useMemo,
	type ReactNode,
} from 'react'
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

	const graph = storyParams.dependencyPreviews?.dependenciesJson
	const currentStoryId = storyParams._storyId

	// Derive the project's source-root directory name (configurable via
	// `SbDepsConfig.srcDir`, defaults to `'src'`) from the graph keys themselves:
	// `postprocess.ts` only keeps modules whose path matches `^<srcDir>/...`, so
	// the leading segment of any graph key is the configured srcDir. Falling back
	// to `'src'` keeps behaviour unchanged when the graph is empty.
	const srcDir = useMemo(() => {
		if (!graph) return 'src'
		const firstKey = Object.keys(graph)[0]
		if (!firstKey) return 'src'
		const leadingSegment = firstKey.split('/')[0]
		return leadingSegment || 'src'
	}, [graph])

	const refinedFilePath = useMemo(() => {
		if (!filePath) return undefined
		const escapedSrcDir = srcDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
		const hostStripRegex = new RegExp(`^.+\\/${escapedSrcDir}\\/`)
		return filePath
			.replace(hostStripRegex, `${srcDir}/`) // remove host from the path
			.replace('.stories.', '.') // remove .stories extension
			.replace('.story.', '.') // remove .story extension
			.replace(/\?.+$/, '') // remove any query string parameters
	}, [filePath, srcDir])

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
			? currentStoryId.replace(/--[^-].*$/, '--docs')
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
