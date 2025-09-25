import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, posix, dirname } from 'node:path'

const [, , inPathArg, outPathArg] = process.argv
const inPath = resolve(inPathArg || '.storybook/dependency-previews.raw.json')
const outPath = resolve(outPathArg || '.storybook/dependency-previews.json')

if (!existsSync(dirname(outPath)))
	mkdirSync(dirname(outPath), { recursive: true })

const raw = JSON.parse(readFileSync(inPath, 'utf8'))
const norm = (p) => posix.normalize(p.replaceAll('\\', '/'))
const isComponent = (p) => /src\/(components|ui|lib)\//.test(p) // tweak later via options

/** @type {Record<string, {uses: string[], usedBy: string[]}>} */
const graph = {}
for (const m of raw.modules || []) {
	const from = norm(m.source)
	if (!isComponent(from)) continue
	const deps = (m.dependencies || [])
		.map((d) => d.resolved && norm(d.resolved))
		.filter(Boolean)
		.filter(isComponent)
	if (!graph[from]) graph[from] = { uses: [], usedBy: [] }
	for (const to of deps) {
		if (!graph[to]) graph[to] = { uses: [], usedBy: [] }
		if (!graph[from].uses.includes(to)) graph[from].uses.push(to)
		if (!graph[to].usedBy.includes(from)) graph[to].usedBy.push(from)
	}
}
for (const k of Object.keys(graph)) {
	graph[k].uses.sort()
	graph[k].usedBy.sort()
}
writeFileSync(outPath, JSON.stringify(graph, null, 2))
