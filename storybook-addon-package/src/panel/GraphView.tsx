import * as React from 'react'

// Same import trick as in the Doc Block
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lineageData from 'virtual:lineage-json'

type Graph = Record<string, { uses: string[]; usedBy: string[] }>

export function GraphView() {
	const graph: Graph | undefined = lineageData as Graph | undefined
	const [q, setQ] = React.useState('')

	if (!graph) return <div>Lineage data not loaded.</div>

	const entries = Object.entries(graph)
		.filter(([k]) => k.toLowerCase().includes(q.toLowerCase()))
		.sort(([a], [b]) => a.localeCompare(b))

	return (
		<div style={{ padding: 12, display: 'grid', gap: 12 }}>
			<input
				placeholder="Filter by file path"
				value={q}
				onChange={(e) => setQ(e.target.value)}
				style={{ padding: 6, font: 'inherit' }}
			/>
			<div style={{ fontSize: 12, opacity: 0.7 }}>
				{entries.length} of {Object.keys(graph).length} components
			</div>
			<div style={{ display: 'grid', gap: 10 }}>
				{entries.map(([file, node]) => (
					<details key={file}>
						<summary>
							<code>{file}</code>
						</summary>
						<div
							style={{
								display: 'grid',
								gap: 6,
								padding: '6px 0 0',
							}}
						>
							<div>
								<strong>Uses</strong>
								<ul>
									{node.uses.map((f) => (
										<li key={f}>
											<code>{f}</code>
										</li>
									))}
								</ul>
							</div>
							<div>
								<strong>Used by</strong>
								<ul>
									{node.usedBy.map((f) => (
										<li key={f}>
											<code>{f}</code>
										</li>
									))}
								</ul>
							</div>
						</div>
					</details>
				))}
			</div>
		</div>
	)
}
