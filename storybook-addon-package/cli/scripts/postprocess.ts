import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, posix, dirname, extname, basename } from 'node:path'
import { toId } from '@storybook/csf'
import type { Deps, Graph, StoryInfo } from '../../src/types.js'
import {
	readFolderEntriesOrNull,
	stripComponentEnding,
} from './fileNames.js'

const [, , inPathArg, outPathArg, srcDirArg, projectFamilyArg] = process.argv
// Only `.component` needs this, and only to tell an Angular component file from
// an ordinary dotted `.ts` name. `sb-deps.ts` passes the family it detected, or
// an empty string when it could not detect one; a direct manual invocation
// passes nothing at all.
//
// Anything but `angular` reads as not-Angular, including both unknowns. An
// extra candidate story name is not free: it is matched against the folder like
// any other, so it can hit a real file. In a project this tool does not
// recognise, an `auth.stories.ts` belonging to `auth.ts` would be taken as the
// story for an `auth.component.ts` sitting beside it — the graph would then
// show one component's story on another. A missing pairing is a gap; a wrong
// one is wrong data, so the guess falls that way.
const nameEndingContext = {
	isAngularProject: projectFamilyArg === 'angular',
}
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
// would drop every module and the graph would come out empty. Mirrors the
// case-tolerant `--include-only` pattern `sb-deps.ts` hands dependency-cruiser.
const isCaseInsensitivePathFs =
	process.platform === 'win32' || process.platform === 'darwin'
const srcDirRegexFlags = isCaseInsensitivePathFs ? 'i' : ''
const srcDirRegex =
	rawSrcDir === ''
		? /^(?!(?:[^/]*\/)*node_modules\/)/
		: new RegExp(
				`^${rawSrcDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/`,
				srcDirRegexFlags,
			)

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
		// Ignore css and html template files, whatever capitals the extension
		// carries. Every other name check in the pipeline spells one name and
		// means one file, because `getWrongCasedNameError` in `sb-deps.ts` turns
		// an oddly-capitalised name away. This one can't rely on that: it reads
		// files dependency-cruiser found, not files the watcher saw created, so a
		// `styles.CSS` written before the addon was installed still reaches it.
		// Getting it wrong here puts a stylesheet in the graph as a component that
		// isn't one — wrong data rather than a missing link, which is why this
		// check reads a name loosely where the rest read it exactly. (The srcDir
		// prefix above ignores capitals too, but for the separate folder-name
		// reason given there.)
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

/**
 * Story answers already worked out, keyed by component path.
 *
 * The loop below asks about the same component once for itself and again for
 * every edge it sits on, and each answer costs a directory listing plus a read
 * of the story file. On this repo's own React example that is 192 questions
 * about 77 components, and the watcher rebuilds on every save. Nothing on disk
 * changes during a build, so one answer per component is enough.
 *
 * Declared HERE, above the loop, not down beside `getStoryId` where it reads
 * more naturally. The loop is top-level code, so a `const` written below it has
 * not been created yet when the loop calls into it, and the build throws
 * `Cannot access 'storyIdCache' before initialization`. The note on
 * `getRawStoryFileData` describes the same hazard from the other side.
 */
const storyIdCache = new Map<string, ReturnType<typeof findStoryId>>()

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
		const usedInEntry: StoryInfo = {
			componentPath: from,
			...(topLevelFromStory && {
				storyId: topLevelFromStory.id,
				storyTitle: topLevelFromStory.title,
				storyTitlePath: topLevelFromStory.titlePath,
				storyFilePath: topLevelFromStory.filePath,
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
	const cached = storyIdCache.get(componentPath)
	// Only `undefined` means unasked. `null` is a real stored answer — "this
	// component has no story" — and it is the answer for most of them, so it has
	// to count as a hit or the cache would miss on exactly the common case.
	if (cached !== undefined) return cached
	const storyId = findStoryId(componentPath)
	storyIdCache.set(componentPath, storyId)
	return storyId
}

function findStoryId(componentPath: string) {
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
 * The extension list is declared inside this function rather than as a
 * top-level `const`, which sidesteps a hazard worth knowing about: the
 * graph-build loop is itself top-level code, so a `const` written BELOW it has
 * not been created yet when the loop calls down into a function that reads it,
 * and the build throws `Cannot access '...' before initialization`. A `const`
 * written above the loop is fine — `storyIdCache` is one — and the build
 * preserves source order, so this is the ordinary rule rather than anything the
 * bundler does. `function` declarations are hoisted, so the functions
 * themselves can sit anywhere.
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
	const componentExt = extname(componentPath)

	// Angular: strip the `.component` suffix so e.g. `Button.component.ts`
	// looks for `Button.stories.ts` rather than `Button.component.stories.ts`.
	//
	// Through the shared rule rather than an inline pattern, so both conditions
	// on that ending travel with it — an Angular project, and a `.ts` or
	// `.html` file. Spelling it here is what let the project half arrive
	// without the extension half.
	const angularBase = stripComponentEnding(base, componentExt, nameEndingContext)
	const isAngular = angularBase !== base

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

	// Read once, not once per candidate: every candidate is built from
	// `componentPath` with only its ending changed, so they all sit in the
	// component's own folder. There are 14 of them for a plain component and 28
	// for an Angular one, and this runs for every module and every edge on every
	// rebuild.
	const folderEntries = readFolderEntriesOrNull(dirname(componentPath))
	if (!folderEntries) return { storyFileData: null, storyFilePath: null }

	for (const path of candidates) {
		const data = getRawFileData(path, folderEntries)
		if (data) return { storyFileData: data, storyFilePath: path }
	}

	return { storyFileData: null, storyFilePath: null }
}

/**
 * A candidate story file's contents, or `false` when the folder holds no file
 * under that exact name.
 *
 * Matched against the folder's own listing rather than asked of `existsSync`,
 * which on Windows and macOS opens `Button.Stories.tsx` when asked for
 * `Button.stories.tsx`. Reading that file would write a story id into the graph
 * for a story Storybook's own exact matching never indexes, so the addon would
 * show a link to a story that isn't there.
 */
function getRawFileData(path: string, folderEntries: ReadonlyArray<string>) {
	if (!folderEntries.includes(basename(path))) return false
	try {
		return readFileSync(path, 'utf8')
	} catch {
		// The listing is taken once for every candidate, so a file can be renamed
		// or deleted in the gap before this read — routine while the watcher is
		// rebuilding on a save. One missing story is a missing link; letting the
		// read throw would end the whole build.
		return false
	}
}
