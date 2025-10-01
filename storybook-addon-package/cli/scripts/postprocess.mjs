import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, posix, dirname, extname } from 'node:path'
import { toId } from '@storybook/csf'

const [, , inPathArg, outPathArg] = process.argv
const inPath = resolve(inPathArg || '.storybook/dependency-previews.raw.json')
const outPath = resolve(outPathArg || '.storybook/dependency-previews.json')

if (!existsSync(dirname(outPath)))
	mkdirSync(dirname(outPath), { recursive: true })

const raw = JSON.parse(readFileSync(inPath, 'utf8'))
const norm = (p) => posix.normalize(p.replaceAll('\\', '/'))
const isComponent = (p) => /src\/(components|ui|lib)\//.test(p) // tweak later via options

/** Simple keyed-push to avoid duplicates */
function pushUnique(list, item) {
	if (!list.some((x) => x.componentPath === item.componentPath)) {
		list.push(item)
	}
}

/** @type {import('../../src/types').Graph} */
const graph = {}

for (const m of raw.modules || []) {
	const from = norm(m.source)
	if (!isComponent(from)) continue

	const deps = (m.dependencies || [])
		.map((d) => d.resolved && norm(d.resolved))
		.filter(Boolean)
		.filter(isComponent)

	if (!graph[from]) graph[from] = { builtWith: [], usedIn: [] }

	for (const to of deps) {
		if (from === to) continue // 🔒 skip self-edges

		if (!graph[to]) graph[to] = { builtWith: [], usedIn: [] }

		// ---- builtWith: from → to
		const toStory = getStoryId(to)
		const builtWithEntry = {
			componentPath: to, // ✅ the dependency, not "from"
			...(toStory && {
				storyId: toStory.id,
				storyTitle: toStory.title,
				storyPath: toStory.path,
			}),
		}
		pushUnique(graph[from].builtWith, builtWithEntry)

		// ---- usedIn: to ← from
		const fromStory = getStoryId(from)
		const usedInEntry = {
			componentPath: from,
			...(fromStory && {
				storyId: fromStory.id,
				storyTitle: fromStory.title,
				storyPath: fromStory.path,
			}),
		}
		pushUnique(graph[to].usedIn, usedInEntry)
	}
}

// Stable sort by path for nicer diffs/UI
const byPath = (a, b) =>
	(a.componentPath || '').localeCompare(b.componentPath || '')

for (const k of Object.keys(graph)) {
	graph[k].builtWith.sort(byPath)
	graph[k].usedIn.sort(byPath)
}

writeFileSync(outPath, JSON.stringify(graph, null, 2))

function getStoryId(componentPath) {
	const rawFileData = getRawStoryFileData(componentPath)
	if (!rawFileData.storyFileData) return null

	const match = rawFileData.storyFileData.match(
		/title:\s*['"`]([^'"`]+)['"`]/,
	)
	if (!match) return null

	const title = match[1]
	return {
		title,
		id: toId(title, 'docs'),
		path: rawFileData.storyFilePath,
	}
}

function getRawStoryFileData(componentPath) {
	const base = componentPath.replace(/\.\w+$/, '')
	const storiesPath = `${base}.stories${extname(componentPath)}`
	const storyPath = `${base}.story${extname(componentPath)}`

	const storiesData = getRawFileData(storiesPath)
	const storyData = getRawFileData(storyPath)

	return {
		storyFileData: storiesData || storyData || null,
		storyFilePath:
			(storiesData && storiesPath) || (storyData && storyPath) || null,
	}
}

function getRawFileData(path) {
	return existsSync(path) && readFileSync(path, 'utf8')
}
