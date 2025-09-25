import { useOf } from '@storybook/blocks'
import { useEffect, useState } from 'react'
import type { Parameters } from 'storybook/internal/csf'
import type { Graph } from '../types'

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

	if (err) return <div>Failed to load dependency previews: {err}</div>
	if (!graph) return <div>Loading dependency previews…</div>
	if (!filePath || !graph[filePath])
		return <div>No dependency previews for this component.</div>

	const node = graph[filePath]

	return (
		<div style={{ display: 'grid', gap: 12 }}>
			<section>
				<h3>Built with</h3>
				{node.builtWith.length ? (
					<ul>
						{node.builtWith.map((f) => (
							<li key={f}>{shortName(f)}</li>
						))}
					</ul>
				) : (
					<p>—</p>
				)}
			</section>
			<section>
				<h3>Used in</h3>
				{node.usedIn.length ? (
					<ul>
						{node.usedIn.map((f) => (
							<li key={f}>{shortName(f)}</li>
						))}
					</ul>
				) : (
					<p>—</p>
				)}
			</section>
		</div>
	)
}

function shortName(file: string) {
	// e.g., components/Button/Button.tsx → Button/Button.tsx
	return file.split('/').slice(-2).join('/')
}
