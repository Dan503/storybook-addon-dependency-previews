import { useOf } from '@storybook/blocks'
import { useEffect, useState } from 'react'
import type { Parameters } from 'storybook/internal/csf'
import type { StoryInfo, Graph } from '../types'
import { DepsPreviewBlock } from '../components/DepsPreviewBlock'

// If you want to fetch instead, change this path to '/lineage.json' and
// ensure you copy the file to your Storybook's staticDir.
// Here we expect the consuming app to import the JSON (via Vite handling JSON).

function getJsonUrl(storyParams?: Parameters) {
	// Allow consumer override via parameters.dependencyPreviews?.url
	return (
		storyParams?.dependencyPreviews?.url || '/dependency-previews.json' // default
	)
}

export function DependencyPreviews() {
	const { story } = useOf<'story'>('story')
	const filePath = story?.parameters?.__filePath as string | undefined
	const refinedFilePath = filePath
		?.replace(/^.+\/src\//, 'src/')
		.replace('.stories.', '.')
		.replace('.story.', '.')

	const url = getJsonUrl(story?.parameters)

	const [graph, setGraph] = useState<Graph | null>(null)
	const [err, setErr] = useState<string | null>(null)

	useEffect(() => {
		let alive = true
		;(async () => {
			try {
				const res = await fetch(url)
				if (!res.ok) throw new Error(`HTTP ${res.status}`)
				const json = (await res.json()) as Graph
				if (alive) setGraph(json)
			} catch (e: any) {
				if (alive) setErr(e?.message || String(e))
			}
		})()
		return () => {
			alive = false
		}
	}, [url])

	const node = graph?.[refinedFilePath!]!

	if (err) return <div>Failed to load dependency previews: {err}</div>
	if (!graph) return <div>Loading dependency previews…</div>
	if (!refinedFilePath || !node)
		return <div>No dependency previews for this component.</div>

	const builtWith = filterOutStoryFiles(node.builtWith)
	const usedIn = filterOutStoryFiles(node.usedIn)

	return (
		<div className="grid gap-2">
			<DepsPreviewBlock deps={builtWith} title="Built with" />
			<DepsPreviewBlock deps={usedIn} title="Used in" />
		</div>
	)
}

function filterOutStoryFiles(array: Array<StoryInfo>): Array<StoryInfo> {
	return array.filter((info) => {
		return (
			!info.componentPath.includes('.stories.') &&
			!info.componentPath.includes('.story.')
		)
	})
}
