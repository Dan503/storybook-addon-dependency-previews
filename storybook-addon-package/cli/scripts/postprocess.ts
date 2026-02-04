import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, posix, dirname, extname, basename, join } from 'node:path'
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
		// Ignore css files
		!/\.(css|scss|sass|less)$/.test(p)
	)
}

// ─────────────────────────────────────────────────────────────────────────────
// Svelte Import Extraction Workaround
// ─────────────────────────────────────────────────────────────────────────────
// dependency-cruiser has a bug where it strips imports from Svelte files
// during TypeScript preprocessing (see: https://github.com/sverweij/dependency-cruiser/issues/1045)
// This workaround parses Svelte files directly to extract imports.

/**
 * Extract import paths from a Svelte file's script blocks
 * This parses the raw source to find imports before TypeScript strips them
 */
function extractSvelteImports(filePath: string): string[] {
	if (!existsSync(filePath)) return []

	const source = readFileSync(filePath, 'utf8')
	const imports: string[] = []

	// Match all script blocks (both regular and module)
	const scriptRegex = /<script[^>]*>([^]*?)<\/script>/gi
	let scriptMatch

	while ((scriptMatch = scriptRegex.exec(source)) !== null) {
		const scriptContent = scriptMatch[1]

		// Match ES6 imports: import X from 'path' or import { X } from 'path'
		const importRegex =
			/import\s+(?:(?:type\s+)?(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g
		let importMatch

		while ((importMatch = importRegex.exec(scriptContent)) !== null) {
			const importPath = importMatch[1]
			// Only include relative imports (not npm packages)
			if (importPath.startsWith('.') || importPath.startsWith('/')) {
				imports.push(importPath)
			}
		}
	}

	return imports
}

/**
 * Resolve a relative import path to an absolute path
 */
function resolveImportPath(
	fromFile: string,
	importPath: string,
): string | null {
	const fromDir = dirname(fromFile)
	let resolved = join(fromDir, importPath)

	// Normalize to forward slashes
	resolved = resolved.replaceAll('\\', '/')

	// If the path doesn't have an extension, try common extensions
	if (!extname(resolved)) {
		const extensions = ['.svelte', '.ts', '.tsx', '.js', '.jsx']
		for (const ext of extensions) {
			if (existsSync(resolved + ext)) {
				return resolved + ext
			}
		}
		// Try index files
		for (const ext of extensions) {
			const indexPath = join(resolved, `index${ext}`)
			if (existsSync(indexPath)) {
				return indexPath.replaceAll('\\', '/')
			}
		}
	}

	if (existsSync(resolved)) {
		return resolved
	}

	return null
}

/**
 * Get all Svelte files in the raw modules
 */
function getSvelteFiles(): string[] {
	const svelteFiles: string[] = []
	for (const m of raw.modules || []) {
		const filePath = norm(m.source)
		if (filePath.endsWith('.svelte') && isComponent(filePath)) {
			svelteFiles.push(filePath)
		}
	}
	return svelteFiles
}

/**
 * Build a map of additional dependencies for Svelte files
 * that dependency-cruiser missed
 */
function buildSvelteDependencyMap(): Map<string, string[]> {
	const depMap = new Map<string, string[]>()
	const svelteFiles = getSvelteFiles()

	for (const filePath of svelteFiles) {
		const imports = extractSvelteImports(filePath)
		const resolvedDeps: string[] = []

		for (const importPath of imports) {
			const resolved = resolveImportPath(filePath, importPath)
			if (resolved && isComponent(resolved)) {
				resolvedDeps.push(norm(resolved))
			}
		}

		if (resolvedDeps.length > 0) {
			depMap.set(filePath, resolvedDeps)
		}
	}

	return depMap
}

// Build the Svelte dependency map for the workaround
const svelteDeps = buildSvelteDependencyMap()

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

	// Get dependencies from dependency-cruiser
	const depsFromCruiser = (m.dependencies || [])
		.map((d: any) => d.resolved && norm(d.resolved))
		.filter(Boolean)
		.filter(isComponent)

	// Merge with Svelte workaround dependencies (if any)
	const svelteDepsForFile = svelteDeps.get(from) || []
	const deps = [...new Set([...depsFromCruiser, ...svelteDepsForFile])]

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

function getRawStoryFileData(componentPath: string) {
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

function getRawFileData(path: string) {
	return existsSync(path) && readFileSync(path, 'utf8')
}
