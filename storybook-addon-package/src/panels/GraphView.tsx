import { useEffect, useState } from 'react'
import type { Graph } from '../types'

const DEFAULT_URL = '/dependency-previews.json'

export function GraphView() {
	const [graph, setGraph] = useState<Graph | null>(null)
	const [q, setQ] = useState('')
	const [err, setErr] = useState<string | null>(null)

	useEffect(() => {
		let alive = true
		;(async () => {
			try {
				const res = await fetch(DEFAULT_URL)
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
	}, [])

	if (err) return <p>Failed to load dependency previews: {err}</p>
	if (!graph) return <p>Loading dependency graph…</p>

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
								<strong>Built with</strong>
								<ul>
									{node.builtWith.map((f) => (
										<li key={f.path}>
											<code>{f.path}</code>
										</li>
									))}
								</ul>
							</div>
							<div>
								<strong>Used in</strong>
								<ul>
									{node.usedIn.map((f) => (
										<li key={f.path}>
											<code>{f.path}</code>
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
