import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, posix, dirname, extname, basename } from 'node:path'
import { toId } from '@storybook/csf'
import type { Deps, Graph, StoryInfo } from '../../src/types.js'

const [, , inPathArg, outPathArg] = process.argv
const inPath = resolve(inPathArg || '.storybook/dependency-previews.raw.json')
const outPath = resolve(outPathArg || '.storybook/dependency-previews.json')

if (!existsSync(dirname(outPath)))
	mkdirSync(dirname(outPath), { recursive: true })

const raw = JSON.parse(readFileSync(inPath, 'utf8'))
const norm = (p: string) => posix.normalize(p.replaceAll('\\', '/'))
const isComponent = (p: string) => {
	return (
		/src\/(components|ui|lib)\//.test(p) &&
		// Ignore css and html template files
		!/\.(css|scss|sass|less|html)$/.test(p)
	)
}

/** Simple keyed-push to avoid duplicates */
function pushUnique(list: Array<StoryInfo>, item: StoryInfo) {
	if (!list.some((x) => x.componentPath === item.componentPath)) {
		list.push(item)
	}
}

const graph: Graph = {}

for (const m of raw.modules || []) {
	const from = norm(m.source)
	if (!isComponent(from)) continue

	const deps = (m.dependencies || [])
		.map((d: any) => d.resolved && norm(d.resolved))
		.filter(Boolean)
		.filter(isComponent)

	const topLevelFromStory = getStoryId(from)

	if (!graph[from])
		graph[from] = {
			componentPath: from,
			...(topLevelFromStory && {
				storyId: topLevelFromStory?.id,
				storyTitle: topLevelFromStory?.title,
				storyTitlePath: topLevelFromStory?.titlePath,
				storyFilePath: topLevelFromStory?.filePath,
			}),
			builtWith: [],
			usedIn: [],
		} satisfies Deps

	for (const to of deps) {
		if (from === to) continue // 🔒 skip self-edges

		// ---- builtWith: from → to
		const toStory = getStoryId(to)
		const builtWithEntry: StoryInfo = {
			componentPath: to, // ✅ the dependency, not "from"
			...(toStory && {
				storyId: toStory.id,
				storyTitle: toStory.title,
				storyTitlePath: toStory.titlePath,
				storyFilePath: toStory.filePath,
			}),
		}

		if (!graph[to])
			graph[to] = {
				...builtWithEntry,
				builtWith: [],
				usedIn: [],
			}

		pushUnique(graph[from].builtWith, builtWithEntry)

		// ---- usedIn: to ← from
		const fromStory = getStoryId(from)
		const usedInEntry: StoryInfo = {
			componentPath: from,
			...(fromStory && {
				storyId: fromStory.id,
				storyTitle: fromStory.title,
				storyTitlePath: fromStory.titlePath,
				storyFilePath: fromStory.filePath,
			}),
		}
		pushUnique(graph[to].usedIn, usedInEntry)
	}
}

// Stable sort by path for nicer diffs/UI
const byPath = (a: StoryInfo, b: StoryInfo) =>
	(a.componentPath || '').localeCompare(b.componentPath || '')

for (const k of Object.keys(graph)) {
	graph[k].builtWith.sort(byPath)
	graph[k].usedIn.sort(byPath)
}

writeFileSync(outPath, JSON.stringify(graph, null, 2))

function getStoryId(componentPath: string) {
	const rawFileData = getRawStoryFileData(componentPath)
	if (!rawFileData.storyFileData) return null

	const match = rawFileData.storyFileData.match(
		/title:\s*['"`]([^'"`]+)['"`]/,
	)
	if (!match) return null

	const titlePath = match[1]
	const title = basename(titlePath).trim()
	return {
		title: title,
		titlePath: titlePath,
		id: toId(titlePath, 'docs'),
		filePath: rawFileData.storyFilePath,
	}
}

/**
 * Story extensions to search when looking up the story file for a given
 * component. Searched in order — first hit wins. Putting the component's own
 * extension first means a `.tsx` component with both `Button.stories.tsx`
 * and `Button.stories.ts` siblings prefers the matching extension, which
 * matches what Storybook itself would resolve.
 */
const STORY_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.svelte', '.mts', '.cts'] as const

/**
 * Locate the story file for `componentPath` by trying every reasonable
 * story extension, not just one that matches the component's own extension.
 *
 * A `.tsx` component with a `.ts` story file is a real-world pattern (story
 * files often have no JSX), so restricting the search to the component's
 * extension misses valid pairings and produces graph entries with no
 * `storyId` — which breaks the autodocs lookup in `useDependencyGraph`.
 */
function getRawStoryFileData(componentPath: string) {
	const base = componentPath.replace(/\.\w+$/, '')

	// Angular: strip the `.component` suffix so e.g. `Button.component.ts`
	// looks for `Button.stories.ts` rather than `Button.component.stories.ts`.
	const angularBase = base.replace(/\.component$/, '')
	const isAngular = angularBase !== base

	const componentExt = extname(componentPath)
	// Search the component's own extension first so matching pairs win when
	// both ambiguous siblings exist.
	const orderedExts = [
		componentExt,
		...STORY_EXTENSIONS.filter((e) => e !== componentExt),
	]

	const candidates: Array<string> = []
	for (const ext of orderedExts) {
		candidates.push(`${base}.stories${ext}`)
		candidates.push(`${base}.story${ext}`)
		if (isAngular) {
			candidates.push(`${angularBase}.stories${ext}`)
			candidates.push(`${angularBase}.story${ext}`)
		}
	}

	for (const path of candidates) {
		const data = getRawFileData(path)
		if (data) return { storyFileData: data, storyFilePath: path }
	}

	return { storyFileData: null, storyFilePath: null }
}

function getRawFileData(path: string) {
	return existsSync(path) && readFileSync(path, 'utf8')
}
