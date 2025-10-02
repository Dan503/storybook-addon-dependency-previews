import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react'
import type { Deps, Graph, StoryInfo } from '../types'
import type { Parameters } from '@storybook/types'
import { useOf } from '@storybook/blocks'

export interface DependencyGraphContextType {
	graph: Graph | null
	error: string | null
	node: Deps | null
}

export const DependencyGraphContext = createContext<DependencyGraphContextType>(
	{
		error: null,
		graph: null,
		node: null,
	},
)

export function useDependencyGraph() {
	return useContext(DependencyGraphContext)
}

export function DependencyGraphProvider({ children }: { children: ReactNode }) {
	const { story } = useOf<'story'>('story')
	const filePath = story?.parameters?.__filePath as string | undefined
	const refinedFilePath = filePath
		?.replace(/^.+\/src\//, 'src/')
		.replace('.stories.', '.')
		.replace('.story.', '.')

	const url = getJsonUrl(story?.parameters)

	const [graph, setGraph] = useState<Graph | null>(null)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		let alive = true
		;(async () => {
			try {
				const res = await fetch(url)
				if (!res.ok) throw new Error(`HTTP ${res.status}`)
				const json = (await res.json()) as Graph
				if (alive) setGraph(json)
			} catch (e: any) {
				if (alive) setError(e?.message || String(e))
			}
		})()
		return () => {
			alive = false
		}
	}, [url])

	const node = useMemo(
		() => graph?.[refinedFilePath!]!,
		[graph, refinedFilePath],
	)

	return (
		<DependencyGraphContext.Provider
			value={{
				error,
				graph,
				node,
			}}
		>
			{children}
		</DependencyGraphContext.Provider>
	)
}

function getJsonUrl(storyParams?: Parameters) {
	// Allow consumer override via parameters.dependencyPreviews?.url
	return (
		storyParams?.dependencyPreviews?.url || '/dependency-previews.json' // default
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
