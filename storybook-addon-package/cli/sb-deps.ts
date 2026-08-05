#!/usr/bin/env node

/* eslint-disable no-console */
import watcherParcel from '@parcel/watcher'
import micromatch from 'micromatch'
import { execFileSync, spawn, type ChildProcess } from 'node:child_process'
import {
	existsSync,
	mkdirSync,
	readFileSync,
	realpathSync,
	statSync,
	writeFileSync,
} from 'node:fs'
import { createRequire } from 'node:module'
import { basename, dirname, extname, join, posix, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import type { SbDepsConfig } from '../src/config.js'
import {
	getNameWithLowerCasedEndings,
	readFolderEntriesOrNull,
} from './scripts/fileNames.js'
import { detectProject, type Framework } from './setup/detect.js'
import { runSetup } from './setup/index.js'

// ───────────────────────────────────────────────────────────────────────────────
// Args
// ───────────────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2)
const SUBCOMMAND = argv[0] && !argv[0].startsWith('--') ? argv[0] : null
const WATCH = argv.includes('--watch')
const RUN_SB_IDX = argv.indexOf('--run-storybook')
const RUN_SB = RUN_SB_IDX !== -1
const _RUN_SB_NEXT = RUN_SB ? argv[RUN_SB_IDX + 1] : undefined
const SB_CUSTOM_CMD =
	_RUN_SB_NEXT && !_RUN_SB_NEXT.startsWith('--') ? _RUN_SB_NEXT : undefined
const PORT_ARGI = argv.indexOf('--sb-port')
const SB_PORT =
	PORT_ARGI !== -1 && argv[PORT_ARGI + 1]
		? Number(argv[PORT_ARGI + 1]) || 6006
		: 6006

// ───────────────────────────────────────────────────────────────────────────────
// Paths
// ───────────────────────────────────────────────────────────────────────────────
/** A path with any symlinks resolved, or the path unchanged if it can't be resolved. */
function resolveRealPath(path: string): string {
	try {
		return realpathSync(path)
	} catch {
		return path
	}
}

// Resolved through any symlinks, because the watcher reports paths under the
// real directory. If this kept the linked spelling, every event would look like
// it sat outside the project and scaffolding would go quietly dead. Falls back
// to the raw value if the path can't be resolved.
const projectRoot = resolveRealPath(process.cwd())
const outDir = resolve(projectRoot, '.storybook')
const rawPath = join(outDir, 'dependency-previews.raw.json')
const cookedPath = join(outDir, 'dependency-previews.json')

// Don't auto-create `.storybook/` for the setup subcommand — the wizard needs to
// detect whether Storybook has been initialised so it can guide the user. The
// regular build/watch path still needs the directory to exist for its JSON output.
if (SUBCOMMAND !== 'setup' && !existsSync(outDir))
	mkdirSync(outDir, { recursive: true })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Resolve depcruise config: prefer project overrides, else bundled default
const pkgDefault = resolve(__dirname, 'scripts', 'depcruise.config.cjs')
const overrideCandidates = [
	resolve(projectRoot, 'depcruise.config.cjs'),
	resolve(projectRoot, '.dependency-cruiser.js'),
	resolve(projectRoot, '.dependency-cruiser.cjs'),
]
const configPath =
	overrideCandidates.find((p) => existsSync(p)) ||
	(existsSync(pkgDefault) ? pkgDefault : null)

// Path to postprocess helper (built as ESM)
const post = resolve(__dirname, 'scripts', 'postprocess.mjs')

// ───────────────────────────────────────────────────────────────────────────────
// Config
// ───────────────────────────────────────────────────────────────────────────────
function checkIsProjectEsm(): boolean {
	try {
		const pkg = JSON.parse(
			readFileSync(resolve(projectRoot, 'package.json'), 'utf8'),
		)
		return pkg.type === 'module'
	} catch {
		return false
	}
}

async function loadSbDepsConfig(): Promise<SbDepsConfig> {
	const candidates = [
		{
			path: resolve(projectRoot, 'sb-deps.config.js'),
			isEsm: checkIsProjectEsm(),
		},
		{ path: resolve(projectRoot, 'sb-deps.config.mjs'), isEsm: true },
		{ path: resolve(projectRoot, 'sb-deps.config.cjs'), isEsm: false },
	]
	for (const { path: cfgPath, isEsm } of candidates) {
		if (!existsSync(cfgPath)) continue
		try {
			if (isEsm) {
				const mod = await import(pathToFileURL(cfgPath).href)
				return (mod.default ?? mod) as SbDepsConfig
			} else {
				const req = createRequire(import.meta.url)
				const mod = req(cfgPath)
				return (mod?.default ?? mod) as SbDepsConfig
			}
		} catch (e) {
			error(`failed to load sb-deps config: ${e}`)
		}
	}
	return {}
}

let ANGULAR_SELECTOR_PREFIX = 'app-'
let SCAFFOLD_CONFIG: SbDepsConfig['scaffold'] = {}
let SRC_DIR = 'src'
// Which extension the scaffolder emits for generated story files —
// `Foo.stories.tsx` vs `Foo.story.tsx`. Config-driven (default `'stories'`,
// Storybook's convention), so all four `storyPathFor*` helpers stay in sync.
type StorybookFileExtension = NonNullable<SbDepsConfig['storybookFileExtension']>
let STORYBOOK_FILE_EXTENSION: StorybookFileExtension = 'stories'

// Framework of the project the CLI is running in — needed to disambiguate a
// `.stories.ts` story with no sibling component (Vue vs Angular both use `.ts`).
// `detectProject` reads package.json + `.storybook/main.*`, so cache the result:
// the framework can't change mid-run.
let cachedProjectFramework: Framework | null = null
function getProjectFramework(): Framework {
	if (!cachedProjectFramework)
		cachedProjectFramework = detectProject(projectRoot).framework
	return cachedProjectFramework
}

// ───────────────────────────────────────────────────────────────────────────────
// Runners
// ───────────────────────────────────────────────────────────────────────────────
const IS_WIN = process.platform === 'win32'

/**
 * Locate the `dependency-cruiser` CLI binary in the user's `node_modules/.bin`.
 * Returns the absolute path with the right extension for the platform (`.cmd`
 * shim on Windows, bare name elsewhere). Falls back to `null` if it can't be
 * found — caller decides what to do.
 *
 * Going through the resolved binary lets us call `execFileSync` directly
 * (with `shell: false`) and pass each flag as its own array element — no
 * shell quoting, no `cmd.exe` metacharacter mangling (`^` is a `cmd.exe`
 * escape character, which would silently strip the `^` anchor from our
 * `--include-only` regex if we went through a shell). It also avoids spawning
 * `npx`, which on Windows is a `.cmd` shim that requires `shell: true` to
 * launch — which would reintroduce the very quoting problem we're trying to
 * avoid.
 */
function resolveDepCruiseBin(): string | null {
	const bin = join(
		projectRoot,
		'node_modules',
		'.bin',
		IS_WIN ? 'depcruise.cmd' : 'depcruise',
	)
	return existsSync(bin) ? bin : null
}

function runDepCruiseOnce() {
	// Pass --include-only at the CLI level so it overrides whatever the loaded
	// depcruise config has (depcruise CLI flags take precedence over config-file
	// options). That way SRC_DIR controls dep-cruiser's scan scope without
	// requiring users with non-`src` layouts to also override the bundled config.
	//
	// The regex must escape any regex metacharacters in SRC_DIR (a value like
	// `src.app` would otherwise broaden the scope unintentionally) and anchor
	// to a `/` so the directory boundary is respected — without the trailing
	// slash `^src` would also match `src2/`, `srcabc/`, etc.
	//
	// dependency-cruiser compiles the pattern with a plain case-SENSITIVE
	// `new RegExp(...)` — unlike the path checks in this file, which all ignore
	// case on the file systems that do. So on those platforms every letter is
	// written as a pair matching both of its cases (`s` → `[sS]`): with srcDir
	// spelled `src` in the config but `Src` on disk, a case-sensitive `^src/`
	// would reject every module dependency-cruiser finds and the graph would
	// come out empty.
	//
	// The empty-srcDir case (project root *is* the source folder) needs a
	// different shape: anchoring on `^/` would still walk node_modules, so
	// switch to a node_modules denylist via negative lookahead that rejects
	// `node_modules` as any path segment — covers nested
	// `packages/foo/node_modules/...` paths in monorepos, not just the
	// top-level folder.
	const escapedSrcDir = escapeForFolderRegex(SRC_DIR)
	const includeOnly =
		SRC_DIR === '' ? '^(?!(?:[^/]*/)*node_modules/)' : `^${escapedSrcDir}/`
	const args: Array<string> = ['.']
	if (configPath) {
		args.push('--config', configPath)
	} else {
		args.push('--no-config')
	}
	args.push('--include-only', includeOnly, '--output-type', 'json')

	const depcruiseBin = resolveDepCruiseBin()
	if (!depcruiseBin) {
		throw new Error(
			'Could not locate `dependency-cruiser` in node_modules/.bin. Run the setup wizard (`sb-deps setup`) or install `dependency-cruiser` as a dev dependency.',
		)
	}

	const start = Date.now()
	// `.cmd` shims on Windows need `shell: true` to launch, BUT once shell is
	// on, cmd.exe re-interprets `^` as an escape character — which would strip
	// the anchor from our regex. Workaround: spawn the `.cmd` itself with
	// shell:true (cmd.exe wraps the call) and pre-escape `^` for cmd.exe by
	// doubling it. On Unix the binary is a real ELF/script (no shim), shell:false
	// is the default, args pass through unmolested.
	const stdout = execFileSync(
		depcruiseBin,
		IS_WIN ? args.map(escapeForCmdExe) : args,
		{
			cwd: projectRoot,
			stdio: ['ignore', 'pipe', 'inherit'],
			encoding: 'utf8',
			shell: IS_WIN,
			// Pass SRC_DIR through to the bundled `depcruise.config.ts` so its
			// `forbidden` rules' path matchers (currently anchored on `^src`)
			// rebuild from the configured srcDir at depcruise's module-load time.
			// User-provided depcruise configs that ignore this env still work —
			// they just won't track srcDir automatically.
			env: { ...process.env, SB_DEPS_SRC_DIR: SRC_DIR },
		},
	)
	writeFileSync(rawPath, stdout, 'utf8')
	info(`graph ✓ (${ms(Date.now() - start)})`)
}

function postprocessOnce() {
	const start = Date.now()
	// `node` is a real executable on every platform (no `.cmd` shim), so we
	// don't need shell:true here — args pass through directly with no quoting
	// or escape concerns.
	execFileSync('node', [post, rawPath, cookedPath, SRC_DIR], {
		cwd: projectRoot,
		stdio: 'inherit',
	})
	info(`compiled ✓ → ${rel(cookedPath)} (${ms(Date.now() - start)})`)
}

/**
 * Escape a folder name for a pattern that has to match a path on disk, matching
 * either capitalisation where the file system treats the two as one folder and
 * exactly where it doesn't.
 *
 * The case rule has to live in the pattern rather than in an ignore-case flag,
 * because both callers build a pattern whose *other* half must stay exact: the
 * `--include-only` argument is compiled by dependency-cruiser with no flags at
 * all, and `buildSrcSubpathRegex` pairs this folder prefix with a file ending
 * that is deliberately case-sensitive. A flag would loosen both halves.
 */
function escapeForFolderRegex(folderName: string): string {
	return IS_CASE_INSENSITIVE_PATH_FS
		? escapeForRegexIgnoringCase(folderName)
		: escapeForRegex(folderName)
}

/**
 * Like `escapeForRegex`, but every letter becomes a pair matching both of its
 * cases (`s` → `[sS]`). Reached through `escapeForFolderRegex`, which owns the
 * decision about when that is wanted.
 */
function escapeForRegexIgnoringCase(text: string): string {
	return text
		.split('')
		.map((char) => {
			const isLetter = /[a-z]/i.test(char)
			return isLetter
				? `[${char.toLowerCase()}${char.toUpperCase()}]`
				: escapeForRegex(char)
		})
		.join('')
}

/** Backslash-escape every character that has a special meaning in a regex, so the text only matches itself. */
function escapeForRegex(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Escape an argument so that it survives `cmd.exe` parsing when `execFileSync`
 * is invoked with `shell: true` on Windows. `^` is the cmd.exe escape character,
 * even inside double quotes — doubling it makes cmd.exe pass through a literal
 * `^`. Other shell metacharacters (`&`, `|`, `<`, `>`, `(`, `)`, `%`, `!`) are
 * already wrapped in double quotes by Node's internal arg-quoter when
 * `shell: true`, so we only need to handle `^` ourselves.
 */
function escapeForCmdExe(arg: string): string {
	return arg.replace(/\^/g, '^^')
}

function buildOnce() {
	try {
		runDepCruiseOnce()
		postprocessOnce()
	} catch (e) {
		error('build failed')
		if (!WATCH) throw e
	}
}

// ───────────────────────────────────────────────────────────────────────────────
// String utils
// ───────────────────────────────────────────────────────────────────────────────
function toWords(input: string) {
	return String(input)
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/[_\-./]+/g, ' ')
		.trim()
		.split(/\s+/)
}
function toTitleCase(words: Array<string>) {
	return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}
function toPascalCase(input: string) {
	return toTitleCase(toWords(input)).replace(/\s+/g, '')
}
function toKebabCase(input: string) {
	return toWords(input)
		.map((w) => w.toLowerCase())
		.join('-')
}

/**
 * Is there nothing at `absPath` worth keeping — no file, or one holding only
 * whitespace? Callers use this to decide whether it's safe to write a scaffold
 * there, so it has to fail on the safe side: a file that exists but can't be
 * read right now (an editor save, antivirus, or cloud sync holding a lock) is
 * reported as NOT empty, so we never write over content we couldn't see. Only a
 * genuinely missing file counts as empty.
 */
function isEmptyOrWhitespace(absPath: string) {
	try {
		// `throwIfNoEntry: false` returns undefined for a missing file instead of
		// throwing — these probes run per story-name variant, so the common
		// "not there" case shouldn't cost an exception.
		const stats = statSync(absPath, { throwIfNoEntry: false })
		if (!stats) return true
		if (stats.size === 0) return true
		const txt = readFileSync(absPath, 'utf8')
		return !txt.trim()
	} catch (e) {
		const isMissing = (e as NodeJS.ErrnoException)?.code === 'ENOENT'
		// Say so when the fail-safe kicks in: an existing-but-unreadable file
		// counts as non-empty, which silently suppresses whatever scaffold asked —
		// and since only create events trigger scaffolding, no later save retries.
		// Without this line the file stays empty with nothing in the log
		// explaining why.
		if (!isMissing) {
			warn(
				`couldn't read "${rel(absPath)}" (${(e as Error)?.message ?? e}) — treating it as having content, so nothing will be scaffolded over it.`,
			)
		}
		return isMissing
	}
}

/**
 * Do this platform's file system (FS) paths ignore case? Windows and macOS
 * treat them as case-insensitive, and comparisons here have to match that, or a
 * casing difference between `process.cwd()` and the paths the watcher reports
 * (drive-letter casing being the usual culprit) reads as a different path.
 */
const IS_CASE_INSENSITIVE_PATH_FS = IS_WIN || process.platform === 'darwin'

/** Lower-case a path on platforms whose file paths ignore case, so two spellings of the same file compare equal. */
function toComparablePath(path: string): string {
	return IS_CASE_INSENSITIVE_PATH_FS ? path.toLowerCase() : path
}

/**
 * Options for the watcher's glob matching. `micromatch` matches case-sensitively
 * by default, which would disagree with every other path check here — those all
 * ignore case on the platforms whose file systems do.
 */
const MICROMATCH_OPTIONS = { nocase: IS_CASE_INSENSITIVE_PATH_FS }

/**
 * The project root, normalised once. `projectRoot` is fixed for the life of the
 * run, and the watcher converts paths for every file event, so deriving these
 * per call would repeat the same string work constantly.
 */
const NORMALISED_PROJECT_ROOT = projectRoot
	.replace(/\\/g, '/')
	.replace(/\/+$/, '')
const PROJECT_ROOT_PREFIX = `${NORMALISED_PROJECT_ROOT}/`
const COMPARABLE_PROJECT_ROOT = toComparablePath(NORMALISED_PROJECT_ROOT)
const COMPARABLE_PROJECT_ROOT_PREFIX = toComparablePath(PROJECT_ROOT_PREFIX)

/**
 * Has the outside-the-project-root warning already been logged? It's a
 * shouldn't-happen case that degrades differently depending on config, so it's
 * worth saying — but only once, since the watcher would otherwise repeat it for
 * every file event.
 */
let hasWarnedAboutPathOutsideRoot = false

/**
 * Convert an absolute path to a project-root-relative, forward-slash path. The
 * `srcSubpathRegex` checks below match against this (not the raw absolute path)
 * so the `srcDir` anchor only ever matches the project's *own* source folder —
 * a `src` (or whatever `srcDir` is) segment sitting *above* the project root
 * (e.g. `C:/dev/src/myproject/...`) must not count as being under `srcDir`.
 */
function toProjectRelativePath(absPath: string): string {
	const normAbs = absPath.replace(/\\/g, '/')
	const comparableAbs = toComparablePath(normAbs)
	if (comparableAbs === COMPARABLE_PROJECT_ROOT) return ''
	const doesStartAtRoot = comparableAbs.startsWith(COMPARABLE_PROJECT_ROOT_PREFIX)
	if (doesStartAtRoot) return normAbs.slice(PROJECT_ROOT_PREFIX.length)
	// Not under the project root — shouldn't happen, since the watcher only
	// reports paths beneath it. Warn rather than degrade silently: with a
	// non-empty srcDir every scaffolding check below would quietly go false,
	// while with an empty srcDir the permissive pattern would match anyway.
	if (!hasWarnedAboutPathOutsideRoot) {
		hasWarnedAboutPathOutsideRoot = true
		warn(
			`"${absPath}" is not inside the project root (${projectRoot}) — scaffolding checks may not behave as expected for it.`,
		)
	}
	return normAbs
}

/**
 * A component's path relative to the source folder, which the story-title
 * builders turn into the title. Falls back to the project-relative path when
 * the file sits outside `srcDir` (and when `srcDir` is empty, i.e. the project
 * root *is* the source folder).
 *
 * Goes through `toProjectRelativePath`, so the root is stripped with the same
 * case-insensitive comparison the scaffolding checks use. Stripping it
 * case-sensitively would leave the whole absolute path in place under a casing
 * difference, producing a title like `C: / Proj / Src / Button` instead of
 * `Button`.
 */
function getPathRelativeToSrcRoot(absCompPath: string): string {
	const projectRelative = toProjectRelativePath(absCompPath)
	if (!SRC_DIR) return projectRelative
	const srcPrefix = `${SRC_DIR}/`
	const doesStartAtSrc = toComparablePath(projectRelative).startsWith(
		toComparablePath(srcPrefix),
	)
	return doesStartAtSrc
		? projectRelative.slice(srcPrefix.length)
		: projectRelative
}

/**
 * Built patterns, keyed by suffix. `SRC_DIR` is fixed once the boot block
 * finishes, so every pattern this can produce is constant for the life of the
 * watcher — and a single create event consults up to six of the checks below.
 */
const srcSubpathRegexCache = new Map<string, RegExp>()

/**
 * The regex matching `<SRC_DIR>/...<suffix>` for the scaffolding-trigger
 * helpers below. Each pattern is built once, at its first call — these helpers
 * run inside the watcher event loop, after the boot block has loaded the
 * config and finalised `SRC_DIR` — and served from the cache above after that.
 * The checks test it against a **root-relative** path (via
 * `toProjectRelativePath`), so the pattern is anchored at the start (`^`) —
 * only the project's own `srcDir` matches, not a same-named segment higher up.
 *
 * Files don't have to live under a `components/` subfolder — same philosophy
 * as the postprocess filter: any source file under `srcDir` with the right
 * extension is a candidate. The framework-agnostic story-file exclusion
 * (`STORY_FILE_REGEX`) is applied separately in the individual helpers.
 */
function srcSubpathRegex(suffixPattern: string): RegExp {
	const cached = srcSubpathRegexCache.get(suffixPattern)
	if (cached) return cached
	const built = buildSrcSubpathRegex(suffixPattern)
	srcSubpathRegexCache.set(suffixPattern, built)
	return built
}

function buildSrcSubpathRegex(suffixPattern: string): RegExp {
	// Empty SRC_DIR (project root *is* the source folder) means there is no
	// subfolder check — match any path that ends with the given suffix. The
	// watcher's ignore list (node_modules, .git, dist, build) keeps the noise
	// out before paths ever reach here, so a permissive regex is fine.
	if (SRC_DIR === '') {
		return new RegExp(`.+${suffixPattern}`)
	}
	// Two halves with two different rules, which is why there is no ignore-case
	// flag on the compiled pattern. The file ending is exact, because an
	// oddly-capitalised one is turned away rather than understood. The folder
	// prefix is not: `srcDir: 'src'` against a `Src/` on disk is one folder to
	// the file system, and matching it exactly would silently switch every
	// scaffolding check below to false. `escapeForFolderRegex` carries that rule
	// in the pattern so only the prefix gets it.
	const escapedSrcDir = escapeForFolderRegex(SRC_DIR)
	return new RegExp(`^${escapedSrcDir}\\/.+${suffixPattern}`)
}

/**
 * The either/or pattern matching `story` or `stories`, shared by
 * `STORY_FILE_REGEX` and `COMPONENT_STORY_TS_REGEX` so the two can't drift
 * apart. (Other spots — `getAlternateStoryNaming` and the watcher globs — still
 * spell the two words out themselves.)
 */
const STORY_WORD_PATTERN = 'stor(?:y|ies)'

/**
 * Matches story files in any framework: `.story.<ext>` or `.stories.<ext>`
 * where `<ext>` is any single-segment file extension (`.svelte`, `.ts`, `.tsx`,
 * `.js`, `.jsx`, `.mdx`, …). Used by the scaffolding-trigger helpers to make
 * sure they don't try to auto-scaffold a story file for an existing story.
 *
 * Matched exactly, with no ignore-case flag, because `getWrongCasedNameError`
 * turns a `Button.Stories.tsx` away before this pattern ever sees it — so it
 * can spell one name and mean one file.
 */
const STORY_FILE_REGEX = new RegExp(`\\.${STORY_WORD_PATTERN}\\.\\w+$`)

/** Splits a `.ts` story path into its base and story suffix, for building Angular's `.component`-carrying spelling. */
const COMPONENT_STORY_TS_REGEX = new RegExp(`^(.*)(\\.${STORY_WORD_PATTERN}\\.ts)$`)

/** Does a file base already end in `.component`? */
const COMPONENT_SUFFIX_REGEX = /\.component$/

/**
 * Is this `<srcDir>/**​/Thing.story.<ext>` or `Thing.stories.<ext>`? Limits
 * story-file scaffolding to the configured source dir, mirroring the component
 * detectors below. The story watcher globs match any directory (so out-of-src
 * stories still trigger a graph rebuild), but scaffolding a story — and
 * backfilling its component — should only fire under SRC_DIR, exactly like
 * component-driven creation, so a root-level `stories/Foo.stories.tsx` never
 * writes `Foo.tsx` into a non-source folder.
 */
function isStoryFileUnderSrc(relPath: string) {
	return srcSubpathRegex(STORY_FILE_REGEX.source).test(relPath)
}

/** Is this `<srcDir>/**​/Thing.tsx` (and not a story file)? */
function isComponentsTsx(relPath: string) {
	return srcSubpathRegex('\\.tsx$').test(relPath) && !STORY_FILE_REGEX.test(relPath)
}

/** Is this `<srcDir>/**​/Thing.svelte` (and not a story file)? */
function isComponentsSvelte(relPath: string) {
	return (
		srcSubpathRegex('\\.svelte$').test(relPath) && !STORY_FILE_REGEX.test(relPath)
	)
}

/** Is this `<srcDir>/**​/Thing.decorator.svelte`? */
function isDecoratorSvelte(relPath: string) {
	return srcSubpathRegex('\\.decorator\\.svelte$').test(relPath)
}

/** Is this `<srcDir>/**​/Thing.vue` (and not a story file)? */
function isComponentsVue(relPath: string) {
	return srcSubpathRegex('\\.vue$').test(relPath) && !STORY_FILE_REGEX.test(relPath)
}

/** Is this `<srcDir>/**​/Thing.component.ts`? */
function isComponentsAngularTs(relPath: string) {
	return srcSubpathRegex('\\.component\\.ts$').test(relPath)
}

/** Is this `<srcDir>/**​/Thing.component.html`? */
function isComponentsAngularHtml(relPath: string) {
	return srcSubpathRegex('\\.component\\.html$').test(relPath)
}

/**
 * The message to print when a file's name spells its extension, or one of
 * `KNOWN_NAME_ENDINGS` in `scripts/fileNames.ts`, with capitals — or `null`
 * when the name is fine.
 *
 * The patterns in this file each spell one name and mean one file, which is
 * only safe because this check turns the odd spellings away first.
 *
 * The Storybook half of the message is only added for a story file. It fires on
 * any created file that clears the watcher's globs, so a plain `Badge.VUE`
 * would otherwise send its author off to read their Storybook stories setting
 * about a file that was never going to appear there.
 */
function getWrongCasedNameError(absPath: string): string | null {
	const fileName = basename(absPath)
	const readyFileName = getNameWithLowerCasedEndings(fileName)
	if (readyFileName === fileName) return null
	const isStoryFile = STORY_FILE_REGEX.test(readyFileName)
	const storybookNote = isStoryFile
		? " Storybook matches its own stories setting exactly too, so a story file spelled with capitals never shows up there either."
		: ''
	return `"${rel(absPath)}" needs a lower-case ending — rename it to "${readyFileName}", and nothing was written for it. These endings are matched exactly.${storybookNote}`
}

/**
 * For a name this tool worked out for itself rather than read off an event:
 * does the folder agree with it? True when the folder holds that exact name, or
 * nothing resembling it — the ordinary "not there yet" case most of the writing
 * paths begin from. False, with a line saying which two names clash, when the
 * folder holds the same name spelled with different capitals.
 *
 * Reading the folder rather than asking whether the file exists is the whole
 * point. On Windows and macOS an existence check happily opens
 * `CardListing.tsx` when asked for `cardlisting.tsx`, so the disagreement the
 * user needs telling about is exactly the one an existence check cannot see.
 *
 * It says no on every platform, including the ones where two spellings really
 * are two separate files. There the alternative is writing a second component
 * beside the one they meant, which is the worse outcome.
 *
 * A folder that can't be read says nothing either way, so it counts as agreeing.
 */
function checkDoesFolderAgreeWithName(builtPath: string): boolean {
	const folder = dirname(builtPath)
	const builtFileName = basename(builtPath)
	const entries = readFolderEntriesOrNull(folder)
	if (!entries || entries.includes(builtFileName)) return true
	const comparableFileName = builtFileName.toLowerCase()
	const differentlyCasedName = entries.find(
		(entry) => entry.toLowerCase() === comparableFileName,
	)
	if (!differentlyCasedName) return true
	error(
		`looked for "${builtFileName}" and found "${differentlyCasedName}" in ${rel(folder)} — the two names differ only in capitals, so rename one of them to match the other.`,
	)
	return false
}


/**
 * Strip a known extension from a file name — `Button.tsx` gives `Button`. The
 * extension has to be spelled exactly, which it always is: a file whose
 * extension carries capitals is turned away by `getWrongCasedNameError` long
 * before anything asks for its base name.
 */
function stripExtension(absPath: string, extension: string) {
	const fileName = basename(absPath)
	return fileName.endsWith(extension)
		? fileName.slice(0, -extension.length)
		: fileName
}

function componentBaseFromComponent(absCompPath: string) {
	return stripExtension(absCompPath, '.tsx')
}

function componentBaseFromSvelteComponent(absCompPath: string) {
	return stripExtension(absCompPath, '.svelte')
}

function componentBaseFromVueComponent(absCompPath: string) {
	return stripExtension(absCompPath, '.vue')
}

function componentBaseFromAngularComponent(absCompPath: string) {
	return basename(absCompPath).replace(/\.component\.(ts|html)$/, '')
}

function angularComponentTsPath(absPath: string) {
	const base = componentBaseFromAngularComponent(absPath)
	return join(dirname(absPath), `${base}.component.ts`)
}

function detectAtomicTag(absPath: string) {
	const adaptedPath = absPath.toLowerCase().replace(/\\/g, '/')
	const tokens = ['atom', 'molecule', 'organism', 'template', 'page', 'icon']
	let best: null | { val: string; idx: number } = null
	for (const t of tokens) {
		const idx = adaptedPath.lastIndexOf(t)
		if (idx !== -1 && (best === null || idx > best.idx)) best = { val: t, idx }
	}
	return best ? best.val : null
}

function storyPathForComponent(absCompPath: string) {
	const dir = dirname(absCompPath)
	const base = componentBaseFromComponent(absCompPath)
	return join(dir, `${base}.${STORYBOOK_FILE_EXTENSION}.tsx`)
}

function storyPathForSvelteComponent(absCompPath: string) {
	const dir = dirname(absCompPath)
	const base = componentBaseFromSvelteComponent(absCompPath)
	return join(dir, `${base}.${STORYBOOK_FILE_EXTENSION}.svelte`)
}

function storyPathForVueComponent(absCompPath: string) {
	const dir = dirname(absCompPath)
	const base = componentBaseFromVueComponent(absCompPath)
	return join(dir, `${base}.${STORYBOOK_FILE_EXTENSION}.ts`)
}

/**
 * The Storybook title for a component — its folders under the source root, then
 * its own name, title-cased and joined with ` / ` (e.g. `Atoms / Badge`).
 *
 * Takes `base` (the component's name without its extension) rather than working
 * it out, because each framework strips a different extension and every caller
 * already has it to hand. That parameter is the *only* thing that differed
 * between the four per-framework builders this replaces.
 */
function makeTitleFromComponent(absCompPath: string, base: string) {
	const relFromSrc = getPathRelativeToSrcRoot(absCompPath)

	const dir = posix.dirname(relFromSrc)
	let segments = dir.split('/').filter(Boolean)
	if (segments[0] && /^components?$/i.test(segments[0]))
		segments = segments.slice(1)

	const titledFolders = segments.map((s) => toTitleCase(toWords(s)))
	const compTitle = toTitleCase(toWords(base))

	const fullStoryPath = [...titledFolders, compTitle].filter(Boolean)

	// remove duplicates (e.g. Folder/Thing/Thing => Folder/Thing)
	const dedupedStoryPath = [...new Set(fullStoryPath)]

	return dedupedStoryPath.join(' / ')
}

// ───────────────────────────────────────────────────────────────────────────────
// Story & component scaffolding
// ───────────────────────────────────────────────────────────────────────────────
/**
 * Files scaffolded since the list was last emptied. `reportImportsThatLeadNowhere`
 * empties it once per watcher event, so it only ever holds what a single event
 * produced.
 */
const scaffoldedPaths: Array<string> = []

/**
 * Write a scaffolded file, and remember it was written so its imports can be
 * checked once the event that produced it has finished.
 *
 * The remembering lives in here rather than beside each call because the
 * writers are many, and one added later would otherwise have to know to record
 * itself.
 */
function writeScaffoldedFile(absPath: string, content: string) {
	writeFileSync(absPath, content, 'utf8')
	scaffoldedPaths.push(absPath)
}

/**
 * Write back a file the **user** wrote, after changing part of it — as against
 * `writeScaffoldedFile` above, which writes content this tool authored.
 *
 * Deliberately not recorded for the import report. The rest of such a file is
 * the user's own code, written against their own build setup, and judging its
 * imports by what this tool knows how to resolve turns their working code into
 * a warning. Only content this tool wrote is worth checking, because only that
 * content is this tool's mistake to make.
 */
function updateUserFile(absPath: string, content: string) {
	writeFileSync(absPath, content, 'utf8')
}

/**
 * Say so when a file this tool has just written names a file that isn't there.
 *
 * The files are read back rather than the writers being trusted, because a
 * project can replace any template through `SCAFFOLD_CONFIG`, and a replacement
 * template's imports are exactly the ones nobody has checked.
 *
 * Called once the watcher event that wrote them has finished rather than as
 * each file is written: one event can write two files that name each other, so
 * an Angular component would otherwise be reported for pointing at a template
 * written a moment later.
 */
function reportImportsThatLeadNowhere() {
	const writtenPaths = scaffoldedPaths.splice(0)
	writtenPaths.forEach((absPath) => {
		const missingPaths = getImportsThatLeadNowhere(absPath)
		if (missingPaths.length === 0) return
		const quotedPaths = missingPaths.map((path) => `"${path}"`).join(', ')
		const isSingle = missingPaths.length === 1
		warn(
			`"${rel(absPath)}" imports ${quotedPaths}, which ${isSingle ? "isn't" : "aren't"} there. Either the file is yet to be written, or the name doesn't match the file it meant.`,
		)
	})
}

/** The relative paths a scaffolded file names that lead to no file on disk. */
function getImportsThatLeadNowhere(absPath: string): Array<string> {
	const content = readFileOrNull(absPath)
	if (!content) return []
	const folder = dirname(absPath)
	return getRelativeImportPaths(content).filter(
		(importedPath) => !checkDoesImportLeadToAFile(folder, importedPath),
	)
}

function readFileOrNull(absPath: string): string | null {
	try {
		return readFileSync(absPath, 'utf8')
	} catch {
		return null
	}
}

/**
 * The ways a scaffolded template names another file: `import … from "…"`, a
 * bare `import "…"`, and Angular's `templateUrl: "…"`. Each captures the quoted
 * path.
 */
const IMPORT_PATH_PATTERNS = [
	/\bfrom\s*['"]([^'"]+)['"]/g,
	/\bimport\s*['"]([^'"]+)['"]/g,
	/\btemplateUrl\s*:\s*['"]([^'"]+)['"]/g,
]

/**
 * Every relative path a scaffolded file names, listed once each. Installed
 * packages are left out: only a path starting `./` or `../` names a file this
 * check could go looking for.
 */
function getRelativeImportPaths(content: string): Array<string> {
	const importedPaths = new Set<string>()
	IMPORT_PATH_PATTERNS.forEach((pattern) => {
		// `matchAll` hands back an iterator rather than an array, which is what
		// `for…of` is for.
		for (const match of content.matchAll(pattern)) {
			const importedPath = match[1]
			if (!importedPath) continue
			const isRelative =
				importedPath.startsWith('./') || importedPath.startsWith('../')
			if (isRelative) importedPaths.add(importedPath)
		}
	})
	return [...importedPaths]
}

/**
 * Extensions an import is allowed to leave off, tried in turn. A story
 * importing `./Button` means `Button.tsx` in a React project and `Button.vue`
 * in a Vue one, and this check has no reason to care which.
 *
 * Wider than the set this tool writes, because it also reads back a file the
 * user wrote — `scaffoldAngularHtmlFromTs` rewrites an existing component's
 * template line — and reporting their `./button.types` as missing when
 * `button.types.d.ts` is right there would be a false alarm in their own code.
 */
const IMPORTABLE_EXTENSIONS = [
	'.ts',
	'.tsx',
	'.d.ts',
	'.mts',
	'.cts',
	'.js',
	'.jsx',
	'.mjs',
	'.cjs',
	'.vue',
	'.svelte',
	'.json',
	'.css',
	'.scss',
	'.sass',
	'.less',
	'.svg',
	'.mdx',
	'.html',
]

/**
 * What a written extension may actually be on disk. TypeScript's own advice for
 * projects using ES modules is to import `./foo.js` and let it resolve to
 * `foo.ts` — this package's own CLI sources do it — so an import naming a
 * JavaScript file that isn't there is not necessarily an import naming nothing.
 */
const SOURCE_EXTENSION_STANDINS: Record<string, Array<string>> = {
	'.js': ['.ts', '.tsx'],
	'.mjs': ['.mts'],
	'.cjs': ['.cts'],
}

/**
 * Does this relative import lead to a file that is there?
 *
 * The name is looked up in the folder's own listing rather than through an
 * existence check, for the reason `checkDoesFolderAgreeWithName` gives: on
 * Windows and macOS `existsSync` opens `CardListing.svelte` when asked for
 * `card-listing.svelte`, so it would pass exactly the import this report exists
 * to catch — one built from the name a component binds to instead of the name
 * of its file.
 *
 * The name is tried as written, then with each extension above appended (an
 * import may leave its extension off), then with the stand-ins above swapped in
 * for a written `.js`. The appending runs whether or not the import already
 * ended in something extension-shaped, because plenty do not mean it:
 * `./Table.Row` ends in `.Row`.
 *
 * **Every** match is considered, not just the first — a folder named `Button`
 * sitting beside `Button.tsx` would otherwise shadow it and have `./Button`
 * reported as missing.
 *
 * A match that turns out to be a folder only counts when the folder holds an
 * `index` file, so `./models.v2` naming a directory with nothing in it is still
 * reported.
 *
 * An unreadable folder returns true — nothing can be said about what is in it,
 * and silence beats calling a file missing on no evidence.
 */
function checkDoesImportLeadToAFile(
	folder: string,
	importedPath: string,
): boolean {
	// A bundler query names the same file — `./icon.svg?raw`, `./x.css?url`.
	const pathWithoutQuery = importedPath.split('?')[0] ?? importedPath
	const absImportPath = resolve(folder, pathWithoutQuery)
	const importFolder = dirname(absImportPath)
	const entries = readFolderEntriesOrNull(importFolder)
	if (!entries) return true
	const wantedName = basename(absImportPath)
	const matchedNames = getNamesToTry(wantedName).filter((name) =>
		entries.includes(name),
	)
	return matchedNames.some((name) =>
		checkCanImportLandHere(join(importFolder, name)),
	)
}

/** Every name on disk that an import written as `wantedName` could be asking for. */
function getNamesToTry(wantedName: string): Array<string> {
	const writtenExtension = extname(wantedName)
	const standIns = SOURCE_EXTENSION_STANDINS[writtenExtension] ?? []
	const nameWithoutExtension = wantedName.slice(
		0,
		wantedName.length - writtenExtension.length,
	)
	return [
		wantedName,
		...IMPORTABLE_EXTENSIONS.map((extension) => `${wantedName}${extension}`),
		...standIns.map((extension) => `${nameWithoutExtension}${extension}`),
	]
}

/** Is this a file, or a folder holding an `index` file an import could land on? */
function checkCanImportLandHere(absPath: string): boolean {
	const folderEntries = readFolderEntriesOrNull(absPath)
	// Not a readable folder, so it is the file the caller matched by name.
	if (!folderEntries) return true
	return IMPORTABLE_EXTENSIONS.some((extension) =>
		folderEntries.includes(`index${extension}`),
	)
}

function scaffoldComponent(absCompPath: string) {
	const base = componentBaseFromComponent(absCompPath)
	const componentName = toPascalCase(base)
	const propsName = `PropsFor${componentName}`

	const tpl =
		SCAFFOLD_CONFIG?.react?.component?.({ componentName, propsName }) ??
		`import type { ReactNode } from 'react'

export interface ${propsName} {
  children?: ReactNode
}

export function ${componentName}({ children }: ${propsName}) {
  return (
    <div className="${componentName}">
      <p>${componentName}</p>
      {children}
    </div>
  )
}
`
	writeScaffoldedFile(absCompPath, tpl)
	info(`scaffolded component → ${rel(absCompPath)}`)
}

function scaffoldStoryForComponent(absCompPath: string, targetStoryPath: string) {
	const base = componentBaseFromComponent(absCompPath)
	const componentName = toPascalCase(base)
	const propsName = `PropsFor${componentName}`
	const title = makeTitleFromComponent(absCompPath, base)
	const atomic = detectAtomicTag(absCompPath)
	const tags = ['autodocs']
	if (atomic) tags.push(atomic)

	const storyTpl =
		SCAFFOLD_CONFIG?.react?.story?.({
			componentName,
			propsName,
			title,
			tags,
			base,
		}) ??
		`import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { ${componentName}, type ${propsName} } from './${base}'

const meta: Meta<typeof ${componentName}> = {
  title: '${title}',
  component: ${componentName},
  tags: ${JSON.stringify(tags)},
  parameters: {
    layout: 'padded',
  } satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {} satisfies ${propsName},
}
`
	writeScaffoldedFile(targetStoryPath, storyTpl)
	info(`scaffolded story → ${rel(targetStoryPath)}`)
	return targetStoryPath
}

/**
 * Return the on-disk story file for `canonicalStoryPath` if one already exists —
 * under either `.story.` / `.stories.` naming AND, for React, either extension
 * (canonical `.tsx`, or a JSX-free `.ts`), AND, for Angular, the
 * `.component`-carrying spelling as well. The canonical path is built from
 * `STORYBOOK_FILE_EXTENSION` and the component's own extension, so it may not
 * match the exact file the user authored; checking every variant is what stops
 * `ensureStoryFor` emitting a duplicate story when the sibling was created under
 * a different naming or extension.
 *
 * Only a **non-empty** file counts. An empty one isn't a story yet — Storybook
 * reports it as having no exports — so treating it as one would refuse to fill
 * a freshly-created story and leave two empty files blaming each other. It also
 * means the story-first caller needs no "ignore the file I'm about to fill"
 * argument: that file is empty by definition, so it can never match here.
 */
function findExistingStory(
	canonicalStoryPath: string,
	framework: StoryFramework,
): string | null {
	const namingVariants = [canonicalStoryPath]
	const alternateStoryPath = getAlternateStoryNaming(canonicalStoryPath)
	if (alternateStoryPath) namingVariants.push(alternateStoryPath)

	// Angular only. Its component file is `Foo.component.ts`, so both
	// `Foo.stories.ts` and `Foo.component.stories.ts` read as its story, while
	// the canonical path only ever spells the first (the base strips
	// `.component`). Every other framework must NOT expand this way — there a
	// `Foo.component.vue` is simply a different component, so matching its story
	// would wrongly suppress scaffolding for `Foo.vue`.
	const variantsWithComponentNaming =
		framework === 'angular'
			? namingVariants.flatMap((path) => {
					const componentSuffixed = getComponentSuffixedStoryNaming(path)
					return componentSuffixed ? [path, componentSuffixed] : [path]
				})
			: namingVariants

	// A React story is `.tsx` by convention but valid JSX-free as `.ts`, so each
	// `.tsx` candidate also stands in for its `.ts` sibling (Vue/Angular `.ts`
	// and Svelte `.svelte` have no such extension ambiguity).
	const allVariants = variantsWithComponentNaming.flatMap((path) =>
		path.endsWith('.tsx') ? [path, path.replace(/\.tsx$/, '.ts')] : [path],
	)

	// No `existsSync` needed — a missing file already reports as empty.
	return allVariants.find((path) => !isEmptyOrWhitespace(path)) ?? null
}

/** Swap a story path between its `.story.<ext>` and `.stories.<ext>` naming. */
function getAlternateStoryNaming(storyPath: string): string | null {
	if (/\.story\.\w+$/.test(storyPath))
		return storyPath.replace(/\.story\.(\w+)$/, '.stories.$1')
	if (/\.stories\.\w+$/.test(storyPath))
		return storyPath.replace(/\.stories\.(\w+)$/, '.story.$1')
	return null
}

/**
 * `Foo.stories.ts` → `Foo.component.stories.ts`, Angular's other accepted story
 * naming (its component file is `Foo.component.ts`, so either base reads
 * naturally). Returns `null` for a path that already carries `.component`, and
 * for anything that isn't a `.ts` story — only Angular uses this shape.
 */
function getComponentSuffixedStoryNaming(storyPath: string): string | null {
	const match = storyPath.match(COMPONENT_STORY_TS_REGEX)
	if (!match) return null
	const [, base, storySuffix] = match
	if (COMPONENT_SUFFIX_REGEX.test(base)) return null
	return `${base}.component${storySuffix}`
}

// ───────────────────────────────────────────────────────────────────────────────
// Svelte scaffolding
// ───────────────────────────────────────────────────────────────────────────────
function scaffoldSvelteComponent(absCompPath: string) {
	const base = componentBaseFromSvelteComponent(absCompPath)
	const componentName = toPascalCase(base)

	const tpl =
		SCAFFOLD_CONFIG?.svelte?.component?.({ componentName }) ??
		`<script lang="ts">
	import type { Snippet } from 'svelte';

	export interface PropsFor${componentName} {
		children?: Snippet;
	}

	const { children }: PropsFor${componentName} = $props();
</script>

<div class="${componentName}">
	<p>${componentName}</p>
	{@render children?.()}
</div>

<style>
	.${componentName} {
		/* styles go here */
	}
</style>
`
	writeScaffoldedFile(absCompPath, tpl)
	info(`scaffolded svelte component → ${rel(absCompPath)}`)
}

function scaffoldSvelteDecorator(absDecoratorPath: string) {
	const fullBase = componentBaseFromSvelteComponent(absDecoratorPath)
	const wrappedBase = fullBase.split('.')[0] ?? fullBase
	const componentName = toPascalCase(wrappedBase)
	// The wrapped component is imported by its file name, not by the name it
	// binds to above. `card-listing.decorator.svelte` sits beside
	// `card-listing.svelte`, so importing `./CardListing.svelte` would name a
	// file that exists on no platform.
	//
	// Deliberately NOT put through `checkDoesFolderAgreeWithName`, unlike the
	// other names this tool works out for itself. Refusing here would leave the
	// decorator empty, and only a file's creation scaffolds it — so after the
	// user fixed the clash, saving the decorator would never fill it and the
	// only way out would be to delete and re-create the file. The import report
	// covers the same ground without that trap: it reads the folder exactly, so
	// a wrapped component sitting there under different capitals is named.
	const componentImportPath = `${wrappedBase}.svelte`

	const tpl =
		SCAFFOLD_CONFIG?.svelte?.decorator?.({
			componentName,
			componentImportPath,
		}) ??
		`<script lang="ts">
	import ${componentName} from "./${componentImportPath}";

	interface DecoratorProps {
	}

	const {  }: DecoratorProps = $props();
</script>

<div class="decorator">
	<${componentName} />
</div>
`
	writeScaffoldedFile(absDecoratorPath, tpl)
	info(`scaffolded svelte decorator → ${rel(absDecoratorPath)}`)
}

function scaffoldStoryForSvelteComponent(
	absCompPath: string,
	targetStoryPath: string,
) {
	const base = componentBaseFromSvelteComponent(absCompPath)
	const componentName = toPascalCase(base)
	const title = makeTitleFromComponent(absCompPath, base)
	const atomic = detectAtomicTag(absCompPath)
	const tags = ['autodocs']
	if (atomic) tags.push(atomic)

	const storyTpl =
		SCAFFOLD_CONFIG?.svelte?.story?.({ componentName, title, tags }) ??
		`<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews'
	import ${componentName}, { type PropsFor${componentName} } from './${base}.svelte'
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: '${title}',
		component: ${componentName},
		tags: [${tags.map((t) => `'${t}'`).join(', ')}],
		parameters: {
			layout: 'padded',
		} satisfies StoryParameters,
	})
	type Args = Omit<PropsFor${componentName}, 'children'>;
</script>

<Story name="Primary" args={{} satisfies Args}>
	<p>${title}</p>
</Story>
`
	writeScaffoldedFile(targetStoryPath, storyTpl)
	info(`scaffolded svelte story → ${rel(targetStoryPath)}`)
	return targetStoryPath
}

// ───────────────────────────────────────────────────────────────────────────────
// Vue scaffolding
// ───────────────────────────────────────────────────────────────────────────────
function scaffoldVueComponent(absCompPath: string) {
	const base = componentBaseFromVueComponent(absCompPath)
	const componentName = toPascalCase(base)

	const tpl =
		SCAFFOLD_CONFIG?.vue?.component?.({ componentName }) ??
		`<script setup lang="ts">
export interface PropsFor${componentName} {
}

const {  } = defineProps<PropsFor${componentName}>()
</script>

<template>
	<div class="${componentName}">
		<slot />
	</div>
</template>
`
	writeScaffoldedFile(absCompPath, tpl)
	info(`scaffolded vue component → ${rel(absCompPath)}`)
}

function scaffoldStoryForVueComponent(
	absCompPath: string,
	targetStoryPath: string,
) {
	const base = componentBaseFromVueComponent(absCompPath)
	const componentName = toPascalCase(base)
	const title = makeTitleFromComponent(absCompPath, base)
	const atomic = detectAtomicTag(absCompPath)
	const tags = ['autodocs']
	if (atomic) tags.push(atomic)

	const storyTpl =
		SCAFFOLD_CONFIG?.vue?.story?.({ componentName, title, tags }) ??
		`import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import ${componentName}, { type PropsFor${componentName} } from './${base}.vue'

const meta: Meta<typeof ${componentName}> = {
	title: '${title}',
	component: ${componentName},
	tags: ${JSON.stringify(tags)},
	parameters: {
		layout: 'padded',
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {} satisfies PropsFor${componentName},
	render: (args) => ({
		components: { ${componentName} },
		setup() {
			return { args }
		},
		template: \`
<${componentName} v-bind="args">
	${componentName}
</${componentName}>\`,
	}),
}
`
	writeScaffoldedFile(targetStoryPath, storyTpl)
	info(`scaffolded vue story → ${rel(targetStoryPath)}`)
	return targetStoryPath
}

// ───────────────────────────────────────────────────────────────────────────────
// Angular scaffolding
// ───────────────────────────────────────────────────────────────────────────────
function storyPathForAngularComponent(absCompPath: string) {
	const dir = dirname(absCompPath)
	const base = componentBaseFromAngularComponent(absCompPath)
	return join(dir, `${base}.${STORYBOOK_FILE_EXTENSION}.ts`)
}

function gcd(a: number, b: number): number {
	return b === 0 ? a : gcd(b, a % b)
}

/**
 * Re-indents extracted HTML so that each indent level is exactly one unit deep.
 * Detects whether the content uses tabs or spaces (and how many spaces per level)
 * and enforces that indentation only ever increases by one level at a time.
 */
function normalizeHtmlIndentation(html: string): string {
	const lines = html.split('\n')
	const indentedLines = lines.filter((l) => l.trim() && /^\s/.test(l))
	if (indentedLines.length === 0) return html

	const usesTabs = indentedLines.some((l) => l.startsWith('\t'))
	let unitSize: number
	let unitChar: string

	if (usesTabs) {
		unitSize = 1
		unitChar = '\t'
	} else {
		const spaceCounts = indentedLines
			.map((l) => (l.match(/^ +/) ?? [''])[0].length)
			.filter((n) => n > 0)
		const g = spaceCounts.reduce((a, b) => gcd(a, b), spaceCounts[0])
		unitSize = g
		unitChar = ' '.repeat(g)
	}

	const rawLevels = lines.map((line) => {
		if (!line.trim()) return -1
		const ws = line.match(/^(\s*)/)?.[1] ?? ''
		if (usesTabs) return [...ws].filter((c) => c === '\t').length
		return Math.round(ws.length / unitSize)
	})

	// Normalize: enforce max +1 increase per step.
	// knownMappings stays sorted by rawLevel.
	const knownMappings: Array<[number, number]> = [[0, 0]]
	let prevRaw = 0
	let prevNorm = 0

	const normLevels = rawLevels.map((raw) => {
		if (raw === -1) return -1
		if (raw === prevRaw) return prevNorm

		if (raw > prevRaw) {
			const existing = knownMappings.find(([r]) => r === raw)
			if (existing) {
				;[prevRaw, prevNorm] = [raw, existing[1]]
				return prevNorm
			}
			prevNorm += 1
			prevRaw = raw
			const insertIdx = knownMappings.findIndex(([r]) => r > raw)
			if (insertIdx === -1) knownMappings.push([raw, prevNorm])
			else knownMappings.splice(insertIdx, 0, [raw, prevNorm])
			return prevNorm
		}

		// Decrease: find the largest known rawLevel <= current
		const below = knownMappings.filter(([r]) => r <= raw)
		const norm = below.length > 0 ? below[below.length - 1][1] : 0
		;[prevRaw, prevNorm] = [raw, norm]
		return norm
	})

	return lines
		.map((line, i) => {
			if (normLevels[i] === -1) return ''
			return unitChar.repeat(normLevels[i]) + line.trimStart()
		})
		.join('\n')
}

function defaultAngularHtmlTemplate(componentName: string) {
	return (
		SCAFFOLD_CONFIG?.angular?.componentHtml?.({ componentName }) ??
		`<p>${componentName}</p>
	<ng-content />
`
	)
}

function scaffoldAngularComponent(
	absCompPath: string,
	templateLocation: 'internal' | 'external',
) {
	const base = componentBaseFromAngularComponent(absCompPath)
	const componentName = toPascalCase(base)
	const className = `${componentName}Component`
	const selector = ANGULAR_SELECTOR_PREFIX + toKebabCase(componentName)
	const dir = dirname(absCompPath)
	const tsPath = join(dir, `${base}.component.ts`)

	if (isEmptyOrWhitespace(tsPath)) {
		const defaultTsTpl =
			templateLocation === 'external'
				? `import { Component, input } from '@angular/core';

@Component({
	selector: '${selector}',
	host: { '[class]': '["${componentName}", class()].join(" ")' },
	templateUrl: './${base}.component.html',
	standalone: true,
	imports: [],
})
export class ${className} {
  class = input<string>('');
}
`
				: `import { Component, input } from '@angular/core';

@Component({
	selector: '${selector}',
	host: { '[class]': '["${componentName}", class()].join(" ")' },
	template: \`
		<p>${componentName}</p>
		<ng-content />
	\`,
	standalone: true,
	imports: [],
})
export class ${className} {
	class = input<string>('');
}
`
		const tsTpl =
			SCAFFOLD_CONFIG?.angular?.component?.({
				componentName,
				className,
				selector,
				base,
				templateLocation,
			}) ?? defaultTsTpl
		writeScaffoldedFile(tsPath, tsTpl)
		info(`scaffolded angular component → ${rel(tsPath)}`)
	}

	// Only scaffold the HTML file when using an external template.
	//
	// No capitals check here, unlike the other names this tool works out: the
	// only path that reaches an external template starts from a just-created
	// `.component.html`, and this rebuilds that same name from that same file,
	// so the folder always holds it under this exact spelling and the check
	// could never say no. A `Button.Component.html` arriving some other way —
	// a branch checkout, a copy — is not covered here or anywhere; see the
	// naming section of the README.
	if (templateLocation === 'external') {
		const htmlPath = join(dir, `${base}.component.html`)
		if (isEmptyOrWhitespace(htmlPath)) {
			writeScaffoldedFile(htmlPath, defaultAngularHtmlTemplate(componentName))
			info(`scaffolded angular template → ${rel(htmlPath)}`)
		}
	}
}

function scaffoldAngularHtmlFromTs(absHtmlPath: string, absTsPath: string) {
	const base = componentBaseFromAngularComponent(absHtmlPath)
	const componentName = toPascalCase(base)

	let isHtmlWritten = false

	// Try to extract inline template from the existing .ts file. Wrapped in a
	// try/catch because a file can be present-but-unreadable (an editor save,
	// antivirus, or cloud-sync lock) — `isEmptyOrWhitespace` deliberately reports
	// that as non-empty so we never overwrite unseen content, which means the
	// read below can throw. The watcher's own per-event try/catch would contain
	// an escape (it logs `failed handling …` and still kicks a rebuild), but it
	// would abandon the rest of this event — degrading to the default template
	// keeps the scaffold going instead.
	if (!isEmptyOrWhitespace(absTsPath)) {
		try {
			const tsContent = readFileSync(absTsPath, 'utf8')
			const match = tsContent.match(/template:\s*`([\s\S]*?)`/)
			if (match) {
				const extractedHtml = normalizeHtmlIndentation(match[1].trim()) + '\n'
				// Write the `.html` BEFORE swapping the `.ts` over to templateUrl,
				// so a failed write at either step still leaves the template in at
				// least one of the two files. The reverse order would strip it out
				// of the `.ts` and then lose it entirely if the `.html` write threw.
				writeScaffoldedFile(absHtmlPath, extractedHtml)
				isHtmlWritten = true
				info(`scaffolded angular template → ${rel(absHtmlPath)}`)
				// Swap template: `...` → templateUrl in the .ts file
				const updated = tsContent.replace(
					/template:\s*`[\s\S]*?`/,
					`templateUrl: './${base}.component.html'`,
				)
				updateUserFile(absTsPath, updated)
				info(`updated angular component to use templateUrl → ${rel(absTsPath)}`)
			}
		} catch (e) {
			// The read, the `.html` write, or the swap-to-templateUrl write can
			// throw. Once the `.html` write has succeeded, the template exists in
			// both files (the `.ts` kept its inline copy) — leave the `.html` as
			// written and just say so, rather than overwriting it with the default.
			if (isHtmlWritten) {
				warn(
					`wrote the template to "${rel(absHtmlPath)}" but couldn't update "${rel(absTsPath)}" to use it (${(e as Error)?.message}) — the component still uses its inline template.`,
				)
				return
			}
			warn(
				`couldn't migrate the inline template from "${rel(absTsPath)}" (${(e as Error)?.message}) — scaffolding the default template instead.`,
			)
		}
	}

	// No inline template migrated (none found, or the read/write failed before
	// the `.html` was written) — fall back to the default scaffold.
	if (!isHtmlWritten) {
		writeScaffoldedFile(absHtmlPath, defaultAngularHtmlTemplate(componentName))
		info(`scaffolded angular template → ${rel(absHtmlPath)}`)
	}
}

function scaffoldStoryForAngularComponent(
	absCompPath: string,
	targetStoryPath: string,
) {
	const base = componentBaseFromAngularComponent(absCompPath)
	const componentName = toPascalCase(base)
	const className = `${componentName}Component`
	const title = makeTitleFromComponent(absCompPath, base)
	const atomic = detectAtomicTag(absCompPath)
	const tags = ['autodocs']
	if (atomic) tags.push(atomic)

	const storyTpl =
		SCAFFOLD_CONFIG?.angular?.story?.({
			componentName,
			className,
			base,
			title,
			tags,
		}) ??
		`import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { ${className} } from './${base}.component'

const meta: Meta<${className}> = {
	title: '${title}',
	component: ${className},
	tags: ${JSON.stringify(tags)},
	parameters: {
		layout: 'padded',
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<${className}>

export const Primary: Story = {
	args: {},
}
`
	writeScaffoldedFile(targetStoryPath, storyTpl)
	info(`scaffolded angular story → ${rel(targetStoryPath)}`)
	return targetStoryPath
}

// ───────────────────────────────────────────────────────────────────────────────
// Story-file creation (mirror of component creation)
// ───────────────────────────────────────────────────────────────────────────────
// Derived from the scaffold-config keys — the single source of truth for which
// frameworks this addon scaffolds — so adding a framework there (e.g. the
// upcoming Solid flavor) expands this union and makes STORY_SCAFFOLDERS fail to
// compile until its scaffolder trio is added.
type StoryFramework = keyof NonNullable<SbDepsConfig['scaffold']>

/**
 * True when a created file's framework `family` matches the project's detected
 * framework, so it should be scaffolded. On a mismatch — a file belonging to a
 * different framework (`.tsx` in a Vue project, `.vue` in React, …), or any
 * framework-specific file in an unknown/unsupported project — logs a warning
 * naming the file's framework and the project's, and returns false so the caller
 * ignores the file instead of scaffolding it as the wrong framework.
 */
function checkDoesFileFrameworkMatchProject(
	family: StoryFramework,
	absPath: string,
): boolean {
	const projectFamily = getProjectFrameworkFamily()
	if (projectFamily === family) return true
	const projectFramework = getProjectFramework()
	warn(
		`ignoring "${rel(absPath)}" — the file's framework is ${family}, but this ` +
			`project's is ${projectFramework}. Framework scaffolding only runs for ` +
			`files matching the project's own framework.`,
	)
	return false
}

/** The scaffold family of the project's own detected framework, or `null` when it's unknown/unsupported. */
function getProjectFrameworkFamily(): StoryFramework | null {
	const projectFramework = getProjectFramework()
	return getFrameworkFamily(projectFramework)
}

/**
 * Map a detected project `Framework` to the scaffold "family" it belongs to
 * (`StoryFramework`), or `null` when the framework is unknown/unsupported (no
 * family). This is the single place that knows, e.g., that both `sveltekit` and
 * `svelte-vite` scaffold Svelte, or that `nextjs-webpack` scaffolds React.
 */
function getFrameworkFamily(framework: Framework): StoryFramework | null {
	switch (framework) {
		case 'react-vite':
		case 'nextjs-webpack':
			return 'react'
		case 'vue3-vite':
			return 'vue'
		case 'sveltekit':
		case 'svelte-vite':
			return 'svelte'
		case 'angular-webpack':
			return 'angular'
		default:
			return null
	}
}

/**
 * Per-framework scaffolders + story-path helper, keyed by `StoryFramework`. Lets
 * `ensureStoryFor` and `scaffoldStoryFromCreatedStoryFile` pick the right trio
 * without four near-identical branches per operation. Angular's component
 * scaffolder takes a template-style arg, wrapped here to `'internal'` (inline
 * template) to match the signature.
 */
const STORY_SCAFFOLDERS: Record<
	StoryFramework,
	{
		component: (compPath: string) => void
		story: (compPath: string, targetStoryPath: string) => string
		storyPath: (compPath: string) => string
	}
> = {
	react: {
		component: scaffoldComponent,
		story: scaffoldStoryForComponent,
		storyPath: storyPathForComponent,
	},
	svelte: {
		component: scaffoldSvelteComponent,
		story: scaffoldStoryForSvelteComponent,
		storyPath: storyPathForSvelteComponent,
	},
	vue: {
		component: scaffoldVueComponent,
		story: scaffoldStoryForVueComponent,
		storyPath: storyPathForVueComponent,
	},
	angular: {
		component: (compPath) => scaffoldAngularComponent(compPath, 'internal'),
		story: scaffoldStoryForAngularComponent,
		storyPath: storyPathForAngularComponent,
	},
}

/**
 * Ensure the component at `absCompPath` has a story file, scaffolding one if it
 * doesn't already exist under either naming variant. The component-side mirror
 * of `scaffoldStoryFromCreatedStoryFile`; called when a component file is
 * created. Returns the scaffolded story path, or `null` when nothing was
 * written — either a story already exists, or the name it would take clashes
 * with one already there under different capitals.
 */
function ensureStoryFor(
	framework: StoryFramework,
	absCompPath: string,
): string | null {
	const { storyPath, story } = STORY_SCAFFOLDERS[framework]
	// The story's name is built from the component's, so a story already on disk
	// under the same name with different capitals has to be reported rather than
	// written over — or, where capitals do tell files apart, doubled up on.
	const canonicalStoryPath = storyPath(absCompPath)
	if (!checkDoesFolderAgreeWithName(canonicalStoryPath)) return null
	if (findExistingStory(canonicalStoryPath, framework)) return null
	return story(absCompPath, canonicalStoryPath)
}

/**
 * Work out the component a created story file belongs to, and which framework's
 * scaffolders to use. `.tsx` → React, `.svelte` → Svelte, `.ts` → React, Vue,
 * or Angular (disambiguated in `resolveTsStoryComponent`). Any other extension
 * (`.js`, `.jsx`, `.mdx`) returns `null` — not something we scaffold.
 */
function resolveComponentForStory(
	absStoryPath: string,
): { compPath: string; framework: StoryFramework } | null {
	const byExtension = getComponentForStoryByExtension(absStoryPath)
	if (!byExtension) return null
	// The component's name is worked out from the story's, so it has to clear the
	// capitals check before anything is done with it. A story named with
	// different capitals to its component pairs with it silently on Windows and
	// macOS, and scaffolds a second component beside it everywhere else.
	if (!checkDoesFolderAgreeWithName(byExtension.compPath)) return null
	return byExtension
}

/** The `resolveComponentForStory` answer before the capitals check, chosen by the story file's extension. */
function getComponentForStoryByExtension(
	absStoryPath: string,
): { compPath: string; framework: StoryFramework } | null {
	const storyBase = absStoryPath.replace(STORY_FILE_REGEX, '')
	const ext = extname(absStoryPath)
	// `.tsx`/`.svelte` are framework-specific — a stray one in a non-matching
	// project is ignored + warned rather than backfilled as the wrong framework.
	// `.ts` names no framework itself, so it's resolved separately — but its
	// sibling lookup runs the same check, since a sibling can name any framework.
	if (ext === '.tsx') {
		if (!checkDoesFileFrameworkMatchProject('react', absStoryPath)) return null
		// Through the shared helper, so the react spelling has one owner. (The
		// `.svelte` branch below can't: the helper has no Svelte spelling, since a
		// `.ts` story can't scaffold one.)
		const compPath = getComponentPathForFamily(storyBase, 'react')
		if (!compPath) return null
		return { compPath, framework: 'react' }
	}
	if (ext === '.svelte') {
		if (!checkDoesFileFrameworkMatchProject('svelte', absStoryPath)) return null
		return { compPath: `${storyBase}.svelte`, framework: 'svelte' }
	}
	if (ext === '.ts') return resolveTsStoryComponent(storyBase, absStoryPath)
	return null
}

/**
 * A `.stories.ts` story can be React, Vue, or Angular — all three use `.ts`
 * story files (React's scaffolded template is JSX-free, so it's valid as `.ts`
 * even though React stories are `.tsx` by convention). Prefer an existing
 * sibling component to decide (`<base>.tsx` → React, `<base>.vue` → Vue,
 * `<base>.component.ts` → Angular); with none present, fall back to the
 * project's detected framework. Svelte is intentionally excluded: its story
 * template is `.svelte`-specific, so a `.ts` Svelte story can't be scaffolded
 * from it.
 */
function resolveTsStoryComponent(
	storyBase: string,
	absStoryPath: string,
): { compPath: string; framework: StoryFramework } | null {
	// A sibling can name any framework, so it has to clear the same check the
	// extension-determined branches run — otherwise a plain `Foo.component.ts`
	// sitting in a React project would scaffold an Angular story into it.
	const sibling = findSiblingComponent(storyBase)
	if (sibling) {
		const projectFamily = getProjectFrameworkFamily()
		if (sibling.framework === projectFamily) return sibling
		// Name the sibling, not the story. The story file itself isn't the
		// mismatched one — its sibling is — so the shared warning would point at
		// the wrong file and hide the actual fix (remove or convert the sibling).
		// That advice only holds when the project has a family, though: with none
		// (unknown/unsupported framework) the fallback below returns null too, so
		// removing the sibling gains nothing — promise nothing then, like the
		// shared mismatch warning.
		const siblingAdvice = projectFamily
			? ' Remove or convert the sibling if the story should be scaffolded.'
			: ''
		warn(
			`ignoring "${rel(absStoryPath)}" — its sibling "${rel(sibling.compPath)}" ` +
				`is a ${sibling.framework} component, but this project's framework is ` +
				`${getProjectFramework()}.${siblingAdvice}`,
		)
		return null
	}
	// No sibling component — fall back to the project's detected framework,
	// which by definition can't mismatch. A `.ts` story can't scaffold Svelte
	// (its template is `.svelte`-specific) and an unknown/unsupported project
	// has no family, so both fall through to null.
	const projectFamily = getProjectFrameworkFamily()
	if (!projectFamily) return null
	const compPath = getComponentPathForFamily(storyBase, projectFamily)
	if (!compPath) return null
	return { compPath, framework: projectFamily }
}

/**
 * Families a `.ts` story can name via a sibling component, in default probe
 * order — `getSiblingProbeOrder` moves the project's own family to the front,
 * so this literal order is only the real probe order when the project has no
 * detected family. Svelte is absent on purpose: its story template is
 * `.svelte`-specific, so a `.ts` story can't be scaffolded from a Svelte
 * component.
 */
const TS_STORY_SIBLING_FAMILIES: Array<StoryFramework> = [
	'react',
	'vue',
	'angular',
]

/** The existing sibling component for a `.ts` story base, or `null` when no candidate spelling is on disk *with content* (an empty file doesn't count — see below). */
function findSiblingComponent(
	storyBase: string,
): { compPath: string; framework: StoryFramework } | null {
	// `for…of` rather than a callback: this stops at the first spelling found.
	// A zero-byte file doesn't count — same rule the rest of this file applies
	// (an empty story isn't a story, an empty component gets backfilled). The
	// mismatch path manufactures exactly this state, since it warns and leaves
	// the created file in place, so an empty stray from another framework would
	// otherwise veto the project's own fallback. `isEmptyOrWhitespace` covers
	// the missing case too, so it replaces the existence check rather than
	// joining it.
	for (const family of getSiblingProbeOrder()) {
		const compPath = getComponentPathForFamily(storyBase, family)
		if (compPath && !isEmptyOrWhitespace(compPath))
			return { compPath, framework: family }
	}
	return null
}

/**
 * The order to probe sibling families in, with the project's own family first.
 * A sibling from any other family can only ever end in a decline, so letting one
 * win the race would veto the correct component sitting right beside it — e.g. a
 * leftover `Foo.tsx` in a Vue project hiding the `Foo.vue` next to it. The other
 * families still follow, so a genuinely cross-framework sibling is found and
 * reported rather than silently ignored.
 */
function getSiblingProbeOrder(): Array<StoryFramework> {
	const projectFamily = getProjectFrameworkFamily()
	if (!projectFamily) return TS_STORY_SIBLING_FAMILIES
	const otherFamilies = TS_STORY_SIBLING_FAMILIES.filter(
		(family) => family !== projectFamily,
	)
	return [projectFamily, ...otherFamilies]
}

/**
 * The component file a `.ts` story base would belong to for `family`, or `null`
 * for a family a `.ts` story can't scaffold (Svelte's template is
 * `.svelte`-specific). Single source for the spelling, so the sibling scan and
 * the project-framework fallback can't drift apart.
 *
 * Angular is the special one: a `Foo.component.stories.ts` story leaves the base
 * as `Foo.component`, so `.component` is only appended when it isn't already
 * there — otherwise this builds a junk `Foo.component.component.ts`.
 */
function getComponentPathForFamily(
	storyBase: string,
	family: StoryFramework,
): string | null {
	if (family === 'react') return `${storyBase}.tsx`
	if (family === 'vue') return `${storyBase}.vue`
	if (family !== 'angular') return null
	const doesStoryBaseIncludeComponent = COMPONENT_SUFFIX_REGEX.test(storyBase)
	return doesStoryBaseIncludeComponent
		? `${storyBase}.ts`
		: `${storyBase}.component.ts`
}

/**
 * Fill a directly-created story file (the mirror of component creation). Skips
 * non-empty files (an existing story is never clobbered), stories whose
 * framework/extension we don't scaffold, and stories whose component already
 * has one under another naming (warned, so the duplicate isn't silent). When the sibling component is missing,
 * the story is filled first and the component backfilled after — the story
 * scaffolder needs the component's path, never its contents — so the
 * component's own watcher event then no-ops on its `ensureStoryFor` guard
 * (the story already exists). Returns the filled story path, or `null` if
 * nothing was scaffolded.
 */
function scaffoldStoryFromCreatedStoryFile(absStoryPath: string): string | null {
	if (!isEmptyOrWhitespace(absStoryPath)) return null
	const resolved = resolveComponentForStory(absStoryPath)
	if (!resolved) return null
	const { compPath, framework } = resolved
	const {
		component: scaffoldFrameworkComponent,
		story: scaffoldFrameworkStory,
		storyPath,
	} = STORY_SCAFFOLDERS[framework]
	// Don't fill a second story when one already exists under the alternate
	// naming (e.g. an empty `Foo.stories.ts` created beside an existing
	// `Foo.story.ts`) — that would produce a duplicate story ID. The
	// just-created trigger file can't be mistaken for a pre-existing story: it
	// is empty, and only non-empty files count as an existing story.
	const canonicalStoryPath = storyPath(compPath)
	const existingStory = findExistingStory(canonicalStoryPath, framework)
	if (existingStory) {
		// Say why. The empty trigger file stays on disk and still matches the
		// Storybook globs, so Storybook will report a file with no exports —
		// which is baffling without a line explaining what suppressed the fill.
		warn(
			`left "${rel(absStoryPath)}" empty — "${rel(existingStory)}" is already the story for this component. Delete whichever one you don't want.`,
		)
		return null
	}
	const isComponentMissing =
		isEmptyOrWhitespace(compPath)
	const createdStory = scaffoldFrameworkStory(compPath, absStoryPath)
	if (isComponentMissing) scaffoldFrameworkComponent(compPath)
	return createdStory
}

// ───────────────────────────────────────────────────────────────────────────────
// Watcher
// ───────────────────────────────────────────────────────────────────────────────
function startWatcher() {
	const root = projectRoot
	// When SRC_DIR === '' (project root is the source folder), `${SRC_DIR}/**/*`
	// would produce `/**/*` — a leading slash that micromatch doesn't match
	// against the relative paths the watcher feeds it. Drop the prefix in that
	// case so we watch every non-ignored file at the project root.
	const srcPrefix = SRC_DIR === '' ? '' : `${SRC_DIR}/`
	const includeGlobs = [
		'**/*.stories.{ts,tsx,js,jsx,mdx,svelte}',
		'**/*.story.{ts,tsx,js,jsx,mdx,svelte}',
		`${srcPrefix}**/*.{ts,tsx,js,jsx,svelte,vue}`,
		`${srcPrefix}**/*.component.html`,
		'depcruise.config.cjs',
		'.dependency-cruiser.{js,cjs}',
	]
	// Compiled once at watcher start rather than per event: micromatch re-parses
	// its patterns on every `isMatch` call, and this is the check every single
	// event passes through, save bursts included.
	const includeMatchers = includeGlobs.map((glob) =>
		micromatch.matcher(glob, MICROMATCH_OPTIONS),
	)

	const ignoreGlobs = [
		'node_modules/**',
		'.git/**',
		'.storybook/**',
		'**/.cache/**',
		'**/dist/**',
		'**/build/**',
	]

	let pending = false
	let timer: NodeJS.Timeout | null = null

	function kick(reason: string, absPath: string) {
		if (pending) return
		pending = true
		if (timer) clearTimeout(timer)
		timer = setTimeout(() => {
			info(`${reason}: ${rel(absPath)}`)
			buildOnce()
			pending = false
		}, 120)
	}

	/**
	 * The framework component-create branches, which differ only by their path
	 * check, their framework family, and the handler they call. Ordered —
	 * the first matching entry wins, mirroring the if-chain this replaces.
	 *
	 * Angular's `.component.html` branch is deliberately not in here: it carries
	 * extra template-migration logic, so it stays inline below.
	 */
	const COMPONENT_CREATE_BRANCHES: Array<{
		checkIsMatch: (relPath: string) => boolean
		family: StoryFramework
		handle: (absPath: string, relPath: string) => Promise<void>
	}> = [
		{
			checkIsMatch: isComponentsTsx,
			family: 'react',
			handle: handleComponentCreation,
		},
		{
			checkIsMatch: isComponentsSvelte,
			family: 'svelte',
			handle: handleSvelteComponentCreation,
		},
		{
			checkIsMatch: isComponentsVue,
			family: 'vue',
			handle: handleVueComponentCreation,
		},
		{
			checkIsMatch: isComponentsAngularTs,
			family: 'angular',
			handle: (absPath, relPath) =>
				handleAngularComponentCreation(absPath, relPath, 'internal'),
		},
	]

	return watcherParcel
		.subscribe(
			root,
			async (err, events) => {
				if (err) {
					error(`watch error ${err?.message || err}`)
					return
				}

				for (const ev of events) {
					// Every scaffold below writes files, and the watcher library
					// ignores the promise this callback returns — so a throw from any
					// write (a just-created file grabbed by antivirus or cloud sync, a
					// read-only folder, a full disk) would escape and kill the whole
					// process, taking Storybook with it under `--run-storybook`. One
					// unwritable file should cost that file, not the session. (`continue`
					// inside this block still moves to the next event, as before.)
					try {
						const abs = ev.path
						// Use the same converter the scaffolding checks use, not `rel()`.
						// `rel()` strips the root prefix case-sensitively, so any casing
						// drift would leave this path absolute, the `srcDir`-anchored
						// component globs would stop matching, and component creates
						// would go silently dead while story globs still matched.
						const relPath = toProjectRelativePath(abs)
						// `nocase` for the same reason: the globs embed the configured
						// source folder, so if its spelling differs from the folder on
						// disk (config `src`, folder `Src` — the same folder to the OS)
						// a case-sensitive match drops component creates here while the
						// source-independent story globs still match.
						//
						// It is also what lets the name check below see an oddly-spelled
						// file at all — but only on the platforms where it is on.
						// `MICROMATCH_OPTIONS` is `nocase` only where the file system
						// ignores capitals, so on Linux these globs match exactly and a
						// name whose *extension* carries capitals (`Gadget.TSX`) matches
						// none of them. That file is dropped here, before the check, and
						// nothing reports it. Widening the globs unconditionally is not
						// the answer: it would also make `Src/` match a `srcDir` of
						// `src` on a file system where those really are two folders.
						if (!includeMatchers.some((isMatch) => isMatch(relPath))) continue

						if (ev.type === 'delete') {
							console.log('Deleted:', relPath)
							kick('unlink', abs)
							continue
						}

						// Every check past this point spells one name and means one
						// file, so a name that could be read two ways is turned away
						// here rather than half-understood further in. The rebuild still
						// fires: the file is real, and leaving it out of the graph until
						// its next save would be worse than including it — the same
						// reasoning as the framework-mismatch fall-through below.
						const nameError =
							ev.type === 'create' ? getWrongCasedNameError(abs) : null
						if (nameError) {
							error(nameError)
							kick(ev.type, abs)
							continue
						}

						// STORY CREATE — fill the story (and its component if missing).
						// Limited to SRC_DIR like the component-create branches below, so a story
						// created outside SRC_DIR never scaffolds a component there.
						// Falls through to the normal rebuild when there's nothing to
						// scaffold (non-empty story, or an extension we don't template).
						if (ev.type === 'create' && isStoryFileUnderSrc(relPath)) {
							if (handleStoryCreation(abs)) continue
						}

						// COMPONENT CREATE — scaffold if empty and ensure story. Only
						// scaffolds when the file's extension matches the project's
						// framework; a mismatch is ignored + warned inside
						// `checkDoesFileFrameworkMatchProject`.
						if (ev.type === 'create') {
							const componentBranch = COMPONENT_CREATE_BRANCHES.find((branch) =>
								branch.checkIsMatch(relPath),
							)
							// On a framework mismatch, fall through to the normal rebuild at
							// the bottom rather than `continue` — the file is still a real
							// source file, so skipping it would leave the graph stale until
							// its next save. (The match check logs its own warning.) The `if`
							// below tests only `isScaffoldableComponent`, which already
							// includes the branch-matched check.
							const isScaffoldableComponent =
								!!componentBranch &&
								checkDoesFileFrameworkMatchProject(componentBranch.family, abs)
							if (isScaffoldableComponent) {
								await componentBranch.handle(abs, relPath)
								// The component file is real whether or not a story came of
								// it — one may already exist, or a name clash may have
								// stopped one being written — so the graph should not have to
								// wait for the file's next save either way. `kick` collapses
								// this with the story kick the handler may already have
								// fired, so the common path still rebuilds once.
								kick(ev.type, abs)
								continue
							}
						}

						// ANGULAR .component.html CREATE
						// A mismatch here falls through to the normal rebuild below, same
						// reasoning as the component branches above. The match check logs
						// its own warning, so keep it out of an inline `&&` chain where
						// that would be easy to miss.
						// `ev.type` first, so the path check (a conversion plus regex work)
						// is skipped for the update events that dominate while editing —
						// same treatment the table branches above get.
						const isAngularHtmlCreate =
							ev.type === 'create' && isComponentsAngularHtml(relPath)
						const isScaffoldableAngularHtml =
							isAngularHtmlCreate &&
							checkDoesFileFrameworkMatchProject('angular', abs)
						if (isScaffoldableAngularHtml) {
							// Named after the template, so it goes through the capitals
							// check like every other name this tool works out for itself.
							const tsPath = angularComponentTsPath(abs)
							if (!checkDoesFolderAgreeWithName(tsPath)) {
								kick(ev.type, abs)
								continue
							}
							if (!isEmptyOrWhitespace(tsPath)) {
								// .ts already exists — scaffold HTML from it (migrate inline template if present)
								if (isEmptyOrWhitespace(abs)) {
									scaffoldAngularHtmlFromTs(abs, tsPath)
								}
								console.log('Angular component creation detected:', rel(abs))
								const createdStory = ensureStoryFor('angular', tsPath)
								if (createdStory) {
									kick('create:story', createdStory)
								}
							} else {
								// .ts doesn't exist yet — existing behavior: scaffold both with external templateUrl
								await handleAngularComponentCreation(
									tsPath,
									rel(tsPath),
									'external',
								)
							}
							continue
						}

						// normal rebuild
						kick(ev.type, abs)
					} catch (e) {
						// `toProjectRelativePath`, not `rel()` — same casing-drift
						// reasoning as the comment at the top of this loop.
						error(
							`failed handling ${ev.type} for ${toProjectRelativePath(ev.path)} — skipping it: ${(e as Error)?.message ?? e}`,
						)
						// Only the scaffolding is skipped. The file the event reported
						// is still real and on disk, so without this the graph would
						// stay stale until the file's next save — the same reasoning as
						// the framework-mismatch fall-through above. `buildOnce` catches
						// its own errors in watch mode, so this can't rethrow.
						kick(ev.type, ev.path)
					} finally {
						// After the event rather than after each write, so two files
						// written by one event can name each other. In a `finally` so
						// every `continue` above reaches it, so a half-written set is
						// still reported, and so the list is emptied either way rather
						// than leaking into the next event.
						reportImportsThatLeadNowhere()
					}
				}
			},
			{ ignore: ignoreGlobs },
		)
		.then((result) => {
			info('watching… (ready)')
			return result
		})
		.catch((e) => error(`watch init failed ${e?.message || e}`))

	function handleStoryCreation(abs: string): boolean {
		const createdStory = scaffoldStoryFromCreatedStoryFile(abs)
		if (createdStory) {
			kick('create:story', createdStory)
			return true
		}
		return false
	}

	async function handleComponentCreation(abs: string, relPath: string) {
		if (isEmptyOrWhitespace(abs)) {
			scaffoldComponent(abs)
		}

		console.log('Component creation detected:', relPath)
		const createdStory = ensureStoryFor('react', abs)
		if (createdStory) {
			kick('create:story', createdStory)
		}
	}

	async function handleSvelteComponentCreation(abs: string, relPath: string) {
		if (isDecoratorSvelte(relPath)) {
			if (isEmptyOrWhitespace(abs)) {
				scaffoldSvelteDecorator(abs)
			}
			return
		}

		if (isEmptyOrWhitespace(abs)) {
			scaffoldSvelteComponent(abs)
		}

		const createdStory = ensureStoryFor('svelte', abs)
		if (createdStory) {
			kick('create:story', createdStory)
		}
	}

	async function handleVueComponentCreation(abs: string, relPath: string) {
		if (isEmptyOrWhitespace(abs)) {
			scaffoldVueComponent(abs)
		}

		console.log('Vue component creation detected:', relPath)
		const createdStory = ensureStoryFor('vue', abs)
		if (createdStory) {
			kick('create:story', createdStory)
		}
	}

	async function handleAngularComponentCreation(
		abs: string,
		relPath: string,
		templateStyle: 'internal' | 'external',
	) {
		if (isEmptyOrWhitespace(abs)) {
			scaffoldAngularComponent(abs, templateStyle)
		}

		console.log('Angular component creation detected:', relPath)
		const createdStory = ensureStoryFor('angular', abs)
		if (createdStory) {
			kick('create:story', createdStory)
		}
	}
}

// ───────────────────────────────────────────────────────────────────────────────
// Storybook child
// ───────────────────────────────────────────────────────────────────────────────
let sbChild: ChildProcess | null = null
async function startStorybook() {
	const isWin = process.platform === 'win32'
	let cmd: string
	let args: string[]
	let shellMode: boolean
	if (SB_CUSTOM_CMD) {
		cmd = SB_CUSTOM_CMD
		args = []
		shellMode = true // shell:true handles quoted args and paths with spaces
	} else {
		cmd = 'npx'
		args = ['-y', 'storybook', 'dev', '-p', String(SB_PORT)]
		shellMode = isWin // ← critical to avoid EINVAL on Win + Git Bash
	}

	info(`[sb-deps] launching: ${cmd} ${args.join(' ')}`)

	sbChild = spawn(cmd, args, {
		cwd: projectRoot,
		stdio: 'inherit',
		shell: shellMode,
		env: process.env,
	})

	sbChild.on('error', (err: any) => {
		error(`spawn failed: ${err?.message || err}`)
	})

	sbChild.on('exit', (code, sig) => {
		info(`storybook exited (${sig || code})`)
		sbChild = null
	})

	info(`storybook running on http://localhost:${SB_PORT}`)
}

// ───────────────────────────────────────────────────────────────────────────────
// Boot
// ───────────────────────────────────────────────────────────────────────────────
;(async () => {
	if (SUBCOMMAND === 'setup') {
		await runSetup(argv.slice(1))
		return
	}

	const cfg = await loadSbDepsConfig()
	ANGULAR_SELECTOR_PREFIX = cfg.angularSelectorPrefix ?? 'app-'
	SCAFFOLD_CONFIG = cfg.scaffold ?? {}
	// `cfg.srcDir` can take three meaningfully-different shapes:
	//
	//   - `undefined` / missing key  → fall back to the bundled default `'src'`.
	//   - exactly `''`               → deliberate project-root sentinel
	//                                  (downstream sites special-case this).
	//   - anything else              → validate against the safe-character
	//                                  allow-list and use, or fall back to
	//                                  `'src'` with a warning.
	//
	// Whitespace-only values (e.g. `srcDir: '   '`) are treated as invalid —
	// trimming produces an empty string, but that's almost certainly a typo,
	// not a deliberate request for project-root mode. Match against the
	// allow-list before stripping whitespace so we can distinguish the two.
	//
	// Allow-list:
	//   - alphanumerics + `.`, `_`, `-` — covers every directory name people
	//     conventionally use (`src`, `app`, `my-source`, `app.v2`, etc.)
	//   - rejects glob metacharacters (`*`, `?`, `[`, `]`, `{`, `}`) that
	//     would otherwise change watcher-glob matching when interpolated into
	//     `${SRC_DIR}/**/*.{ts,...}`
	//   - rejects path separators (`/`, `\`) — srcDir must be a single segment
	//     (`projects/foo/src` style multi-project Angular workspaces aren't
	//     supported; use the empty-string project-root mode instead)
	//   - rejects cmd.exe metacharacters including `%` (which triggers `%VAR%`
	//     env expansion when the args go through a `cmd.exe`-invoked `.cmd`
	//     shim on Windows) and `^` / `&` / `|` / `<` / `>` / `(` / `)` / `!`
	//
	// Bounding the input here means downstream interpolation sites can trust
	// their `SRC_DIR` source and don't each need their own escape pass.
	const SAFE_SRCDIR_PATTERN = /^[A-Za-z0-9._-]+$/
	const userSrcDir = cfg.srcDir
	if (userSrcDir === undefined) {
		SRC_DIR = 'src'
	} else if (userSrcDir === '') {
		SRC_DIR = ''
	} else {
		const trimmed = userSrcDir.replace(/[\\/]+$/, '').trim()
		// Reject the special path segments `.` and `..` explicitly — they
		// match the character allow-list but they're path-traversal segments,
		// not real folder names, and would produce broken include-only regexes
		// (e.g. `^./` matches "any-char then slash") plus potentially escape
		// the project root when joined with other paths.
		const isSpecialSegment = trimmed === '.' || trimmed === '..'
		if (
			trimmed !== '' &&
			!isSpecialSegment &&
			SAFE_SRCDIR_PATTERN.test(trimmed)
		) {
			SRC_DIR = trimmed
		} else {
			error(
				`srcDir "${userSrcDir}" is invalid — must be either exactly the empty string (project root) or a single directory name containing only alphanumerics, ".", "_", or "-" (e.g. "src", "app", "my-source"). "." and ".." are not allowed. Falling back to "src".`,
			)
			SRC_DIR = 'src'
		}
	}

	// `storybookFileExtension` comes from a config file that isn't type-checked
	// at runtime (a JS config can hold any value), so validate it against the
	// known set the same way `srcDir` is above — warn and fall back to the
	// default `'stories'` for anything unrecognised, rather than letting a stray
	// value produce broken story filenames.
	const configuredStorybookFileExtension = cfg.storybookFileExtension
	if (configuredStorybookFileExtension === undefined) {
		STORYBOOK_FILE_EXTENSION = 'stories'
	} else if (
		configuredStorybookFileExtension === 'story' ||
		configuredStorybookFileExtension === 'stories'
	) {
		STORYBOOK_FILE_EXTENSION = configuredStorybookFileExtension
	} else {
		error(
			`storybookFileExtension "${configuredStorybookFileExtension}" is invalid — must be 'story' or 'stories'. Falling back to 'stories'.`,
		)
		STORYBOOK_FILE_EXTENSION = 'stories'
	}

	banner('sb-deps')
	info(`outDir: ${rel(outDir)}`)
	info(configPath ? `config: ${rel(configPath)}` : 'config: (none)')
	buildOnce()

	let watcher: watcherParcel.AsyncSubscription | null = null
	if (WATCH) startWatcher().then((w) => (watcher = w || null))
	if (RUN_SB) startStorybook()

	process.on('SIGINT', async () => {
		info('shutting down…')
		await watcher?.unsubscribe()
		sbChild?.kill('SIGINT')
		process.exit(0)
	})
})()

// ───────────────────────────────────────────────────────────────────────────────
// Utils
// ───────────────────────────────────────────────────────────────────────────────
function rel(p: string) {
	// remove the projectRoot prefix and normalize slashes for logs, so paths
	// read the same whether they came through here or `toProjectRelativePath`
	const prefix = resolve(projectRoot) + sep
	return p.replace(prefix, '').replace(/\\/g, '/')
}
function ms(n: number) {
	return `${Math.max(1, Math.round(n))}ms`
}
function info(msg: string) {
	console.log('[sb-deps]', msg)
}
function warn(msg: string) {
	console.warn('[sb-deps]', msg)
}
function error(msg: string) {
	console.error('[sb-deps]', msg)
}
function banner(title: string) {
	console.log(`\n${title} – dependency previews\n`)
}
function wait(time = 500) {
	return new Promise((r) => setTimeout(r, time))
}
