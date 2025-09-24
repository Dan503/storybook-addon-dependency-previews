import { useOf } from '@storybook/blocks'

// If you want to fetch instead, change this path to '/lineage.json' and
// ensure you copy the file to your Storybook's staticDir.
// Here we expect the consuming app to import the JSON (via Vite handling JSON).

type Graph = Record<string, { uses: string[]; usedBy: string[] }>

// Consumers will alias this import (see examples/.storybook/main.ts)
// so we keep the path constant from the addon POV.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lineageData from 'virtual:lineage-json'

export function DependencyPreviews() {
	const { story } = useOf<'story'>('story')
	const filePath = story?.parameters?.__filePath as string | undefined

	const graph: Graph | undefined = lineageData as Graph | undefined

	if (!filePath || !graph) {
		return <div>No lineage data available.</div>
	}

	const node = graph[filePath]
	if (!node) {
		return <div>No lineage found for this component.</div>
	}

	return (
		<div style={{ display: 'grid', gap: 12 }}>
			<section>
				<h3>Built with</h3>
				{node.uses.length ? (
					<ul>
						{node.uses.map((f) => (
							<li key={f}>{shortName(f)}</li>
						))}
					</ul>
				) : (
					<p>—</p>
				)}
			</section>
			<section>
				<h3>Used in</h3>
				{node.usedBy.length ? (
					<ul>
						{node.usedBy.map((f) => (
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
