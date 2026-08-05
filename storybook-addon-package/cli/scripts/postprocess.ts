import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, posix, dirname, extname, basename } from 'node:path'
import { toId } from '@storybook/csf'
import type { Deps, Graph, StoryInfo } from '../../src/types.js'
import {
	IS_CASE_INSENSITIVE_PATH_FS,
	escapeForRegex,
	findOnDiskFileName,
	readFolderEntriesOrNull,
} from './shared.js'

const [, , inPathArg, outPathArg, srcDirArg] = process.argv
const inPath = resolve(inPathArg || '.storybook/dependency-previews.raw.json')
const outPath = resolve(outPathArg || '.storybook/dependency-previews.json')
// `srcDirArg` can take three meaningfully-different shapes:
//
// - `undefined` — direct invocation omitted the third arg entirely; fall
//   back to the bundled default `'src'`.
// - `''` — explicit project-root sentinel passed deliberately from
//   `sb-deps.ts` (after the validator has accepted `srcDir: ''` from the
//   user config). Switches the filter to a node_modules denylist that
//   rejects `node_modules` as any path segment (top-level *or* nested under
//   workspace packages).
// - anything else — trim any trailing slashes and whitespace and use as the
//   `<srcDir>/` anchor. If trimming leaves the empty string (the user
//   passed `"  "` or similar by mistake), don't promote that to project-root
//   mode — fall back to `'src'` instead, since whitespace-only input is
//   almost certainly unintentional.
const rawSrcDir: string =
	srcDirArg === undefined
		? 'src'
		: srcDirArg === ''
			? ''
			: srcDirArg.replace(/[\\/]+$/, '').trim() || 'src'
// Match the srcDir prefix ignoring case on the platforms whose file systems
// do — dependency-cruiser reports module paths with their on-disk spelling, so
// with srcDir `src` in the config but `Src` on disk, a case-sensitive filter
// would drop every module and the graph would come out empty. Reaches the same
// outcome as the `--include-only` pattern `sb-deps.ts` hands dependency-cruiser
// by a different route: this regex is compiled here, so it can take the
// ignore-case flag, while that one is compiled by dependency-cruiser with no
// flags and has to spell both cases out. Only the platform rule itself is
// shared, so the two still have to be changed together.
const srcDirRegexFlags = IS_CASE_INSENSITIVE_PATH_FS ? 'i' : ''
const srcDirRegex =
	rawSrcDir === ''
		? /^(?!(?:[^/]*\/)*node_modules\/)/
		: new RegExp(`^${escapeForRegex(rawSrcDir)}\\/`, srcDirRegexFlags)

if (!existsSync(dirname(outPath)))
	mkdirSync(dirname(outPath), { recursive: true })

const raw = JSON.parse(readFileSync(inPath, 'utf8'))
const norm = (p: string) => posix.normalize(p.replaceAll('\\', '/'))
/**
 * Decide whether a module path from dep-cruiser should appear in the graph.
 *
 * The `srcDir` arg (defaults to `'src'`, configurable via `SbDepsConfig.srcDir`
 * and passed to this script via the third CLI argument) constrains modules to
 * the project's source-root directory. CSS / HTML asset extensions are dropped.
 *
 * A previous version of this filter ALSO restricted to a hardcoded directory
 * list like `src/(components|ui|lib)/`, which broke any project laying out
 * components anywhere else — including any fresh `@storybook/sveltekit` install,
 * where the init wizard scaffolds its sample components under `src/stories/`.
 *
 * Files without a `.stories.X` sibling still degrade gracefully downstream:
 * `getStoryId` returns `null` for them, the resulting graph entry has no
 * `storyId`, and `DepsPreviewItem` renders them as plain (non-clickable) leaves
 * via its `storyId ? <Expandable> : <StoryLink>` ternary.
 */
const isComponent = (p: string) => {
	return (
		srcDirRegex.test(p) &&
		// Ignore css and html template files, whatever their extension's casing —
		// dependency-cruiser reports the on-disk spelling, so a `styles.CSS`
		// would otherwise slip through as a bogus component node.
		!/\.(css|scss|sass|less|html)$/i.test(p)
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

	const match = rawFileData.storyFileData.match(/title:\s*['"`]([^'"`]+)['"`]/)
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
 * Locate the story file for `componentPath` by trying every reasonable
 * story extension, not just one that matches the component's own extension.
 *
 * A `.tsx` component with a `.ts` story file is a real-world pattern (story
 * files often have no JSX), so restricting the search to the component's
 * extension misses valid pairings and produces graph entries with no
 * `storyId` — which breaks the autodocs lookup in `useDependencyGraph`.
 *
 * The extension list is declared inside this function (rather than as a
 * top-level `const`) because the bundler reorders the module so the
 * top-level graph-build loop runs before any top-level `const` is
 * initialised. A `const` referenced from inside the loop's call chain
 * would hit the temporal-dead-zone; `function` declarations are hoisted
 * so the function itself is fine.
 */
function getRawStoryFileData(componentPath: string) {
	// Searched in order — first hit wins. Putting the component's own
	// extension first means a `.tsx` component with both `Button.stories.tsx`
	// and `Button.stories.ts` siblings prefers the matching extension, which
	// matches what Storybook itself would resolve.
	const STORY_EXTENSIONS = [
		'.ts',
		'.tsx',
		'.js',
		'.jsx',
		'.svelte',
		'.mts',
		'.cts',
	] as const

	const base = componentPath.replace(/\.\w+$/, '')

	// Angular: strip the `.component` suffix so e.g. `Button.component.ts`
	// looks for `Button.stories.ts` rather than `Button.component.stories.ts`.
	// Case-insensitive to match the `.component` checks in `sb-deps.ts` — the
	// watcher admits (and scaffolds a story for) a `Button.Component.ts`, so a
	// case-sensitive strip here would miss that story and drop the graph link.
	const angularBase = base.replace(/\.component$/i, '')
	const isAngular = angularBase !== base

	// Lower-cased, like the watcher's own `extname(...).toLowerCase()`: it admits
	// a component whose extension carries capitals, so `Button.TSX` must still
	// probe `.tsx` candidates. Left as-is, the odd-cased spelling is probed first
	// and — where capitals don't distinguish files — matches, writing a
	// `storyFilePath` no case-sensitive lookup in the addon can find.
	const componentExt = extname(componentPath).toLowerCase()
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

	// Each candidate has its spelling resolved *before* it is read. Reading first
	// would be cheaper, but `existsSync` inside the read is exactly the gate the
	// resolve exists to get past: on a volume that tells capitals apart while the
	// platform says otherwise, the probed spelling misses and the
	// differently-capitalised story beside it is never found.
	//
	// Every candidate sits in the component's own folder, so one listing serves
	// them all and the resolve costs a single read rather than one per candidate.
	// Only worth reading where two spellings can name one file — elsewhere
	// `toOnDiskPath` hands back the path untouched and never looks at the list.
	const folderEntries = IS_CASE_INSENSITIVE_PATH_FS
		? readFolderEntriesOrNull(dirname(componentPath))
		: null

	for (const path of candidates) {
		// Report the spelling the folder uses, not the one probed. Where capitals
		// don't distinguish files a probe for `Button.stories.tsx` reads a
		// `Button.STORIES.tsx` quite happily, and writing the probed name into the
		// graph gives the addon a `storyFilePath` its case-sensitive lookup can
		// never match — the component then shows a missing-story error even though
		// Storybook indexed the story.
		const onDiskPath = toOnDiskPath(path, folderEntries)
		const data = getRawFileData(onDiskPath)
		if (data) return { storyFileData: data, storyFilePath: onDiskPath }
	}

	return { storyFileData: null, storyFilePath: null }
}

/**
 * The path with its file name spelled the way the folder spells it, on the
 * platforms where two spellings name one file. Elsewhere the path is returned
 * unchanged, because there a differently-capitalised entry is a different file
 * and must not be substituted for the one asked about.
 *
 * Graph keys and `storyFilePath` are read back by the addon with case-sensitive
 * lookups, so a spelling that only the file system would forgive is of no use
 * to it.
 */
function toOnDiskPath(
	path: string,
	folderEntries: ReadonlyArray<string> | null,
) {
	const onDiskFileName = findOnDiskFileName(path, false, folderEntries)
	return posix.join(dirname(path), onDiskFileName)
}

function getRawFileData(path: string) {
	return existsSync(path) && readFileSync(path, 'utf8')
}
