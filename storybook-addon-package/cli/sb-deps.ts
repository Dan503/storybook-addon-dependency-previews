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
import {
	detectProject,
	tsxFrameworkFromFramework,
	type Framework,
	type TsxFramework,
} from './setup/detect.js'
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

/**
 * Validate a string config value against a known set of choices. An unset
 * (`undefined`) field silently takes `fallback`; an unrecognised value warns and
 * falls back. A JS config file isn't type-checked at runtime, so string-choice
 * fields are guarded here rather than trusting whatever the file holds.
 */
function validateConfigChoice<T extends string>(
	fieldName: string,
	value: string | undefined,
	allowed: ReadonlyArray<T>,
	fallback: T,
): T {
	if (value === undefined) return fallback
	if (allowed.includes(value as T)) return value as T
	const choices = allowed.map((choice) => `'${choice}'`).join(' or ')
	error(
		`${fieldName} "${value}" is invalid — must be ${choices}. Falling back to '${fallback}'.`,
	)
	return fallback
}

let ANGULAR_SELECTOR_PREFIX = 'app-'
let SCAFFOLD_CONFIG: SbDepsConfig['scaffold'] = {}
let SRC_DIR = 'src'
// Which extension the scaffolder emits for generated story files —
// `Foo.stories.tsx` vs `Foo.story.tsx`. Config-driven (default `'stories'`,
// Storybook's convention), so all four `storyPathFor*` helpers stay in sync.
type StorybookFileExtension = NonNullable<SbDepsConfig['storybookFileExtension']>
let STORYBOOK_FILE_EXTENSION: StorybookFileExtension = 'stories'
// Path patterns the scaffolder leaves alone, from the config. Empty by
// default, so a project that says nothing keeps the behaviour it has.
let SCAFFOLD_IGNORE: Array<string> = []

// React, Solid and Preact all author `.tsx` components, so the extension alone
// can't tell them apart. `tsxFramework` picks which templates a `.tsx`
// component or story gets — Solid emits a `solid-js` `createSignal`/`mergeProps`
// component and a `storybook-solidjs-vite` story import, Preact a
// `preact/hooks` component and a `@storybook/preact-vite` story import. The
// config key wins where it is set; where it is absent the detected framework
// decides, so a Solid or Preact project without the key still gets its own
// templates. Both still route through the `react` scaffold family (see
// `getFrameworkFamily`); only the emitted template text differs.
let TSX_FRAMEWORK: TsxFramework = 'react'

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
	// `new RegExp(...)`, and it cannot be handed a flag. The FOLDER half of a
	// path still has to ignore case on the file systems that do — file endings
	// are matched exactly now, but folder names are not, for the reason
	// `escapeForFolderRegex` gives. So on those platforms every letter is
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
	// The framework goes with it because `.component` only means anything in an
	// Angular project — every framework here writes `.ts` files, so the
	// extension alone can't tell an Angular component from an ordinary dotted
	// name. The graph filter runs as its own process and has no other way to
	// know.
	const projectFamily = getProjectFrameworkFamily() ?? ''
	execFileSync('node', [post, rawPath, cookedPath, SRC_DIR, projectFamily], {
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
 * Neither caller can reach for an ignore-case flag, for its own reason. The
 * `--include-only` argument is a string dependency-cruiser compiles itself, so
 * there is nowhere to put a flag. `buildSrcSubpathRegex` compiles its own
 * pattern but pairs this folder prefix with a file ending that is deliberately
 * exact, so a flag would loosen the half that must not loosen.
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
 * by default, which would disagree with how a path's FOLDER half is matched
 * everywhere else here — that still ignores case on the platforms whose file
 * systems do. File endings are matched exactly, but these globs have to admit
 * an oddly-spelled one so the name check below can see it and say so; matching
 * exactly here would turn that error into silence.
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
 * Matched exactly, with no ignore-case flag, so it can spell one name and mean
 * one file. What makes that safe is that a `Button.Stories.tsx` is refused by
 * `getWrongCasedNameError` and never scaffolded from. This pattern does get
 * evaluated on one first — the watcher works out what kind of file it is
 * looking at before running that check — but no answer of this pattern's is
 * read until the check has had its chance to turn the file away.
 */
const STORY_FILE_REGEX = new RegExp(`\\.${STORY_WORD_PATTERN}\\.\\w+$`)

/** Splits a `.ts` story path into its base and story suffix, for building Angular's `.component`-carrying spelling. */
const COMPONENT_STORY_TS_REGEX = new RegExp(`^(.*)(\\.${STORY_WORD_PATTERN}\\.ts)$`)

/** Does a file base already end in `.component`? */
const COMPONENT_SUFFIX_REGEX = /\.component$/

/**
 * A name the generated code can use, matching what JavaScript itself accepts:
 * a letter, `_` or `$` to start, then letters, digits, `_` or `$`. Anything
 * else — a square bracket, a `+`, a space, a leading digit — is a name no
 * template can put in front of `export function`.
 *
 * "Letter" means any language's, via the `ID_Start` and `ID_Continue`
 * properties the language is itself defined in terms of, so `Café.tsx` and
 * `按钮.tsx` are accepted — both scaffold code that parses. Spelling the set
 * out as `A-Za-z` instead would refuse them, which is what this did at first
 * and is a regression for anyone not naming components in English.
 * `Foo².tsx` is still refused: a superscript two is a number to Unicode but
 * not one JavaScript will take.
 */
const CODE_NAME_REGEX = /^[\p{ID_Start}_$][\p{ID_Continue}$\u200C\u200D]*$/u

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
 * The `scaffoldIgnore` patterns, compiled. Built on first use rather than at
 * module load, because `SCAFFOLD_IGNORE` is read from the config in the boot
 * block — which runs after this module is evaluated, and before anything is
 * ever scaffolded.
 */
let scaffoldIgnoreMatchers: Array<(path: string) => boolean> | null = null

/**
 * Was this file one the config told the scaffolder to leave alone?
 *
 * Takes the absolute path and converts it itself, so the patterns are matched
 * against a project-relative path with forward slashes wherever this is asked
 * from — the watcher has that form to hand, the story-to-component lookup does
 * not, and a helper each caller has to prepare for is one a caller can prepare
 * wrongly.
 *
 * Matched with the watcher's own options, so on the file systems that ignore
 * capitals the whole path does — the file name as well as the folders. A
 * pattern spelling `src/routes` covers a `Src/Routes` on disk, and one naming
 * files by their ending covers a `Foo.Page.tsx` as well as a `Foo.page.tsx`.
 * That is wider than the folder-only rule the rest of this file applies, and
 * deliberately so: these patterns are the user naming their own paths, not the
 * tool deciding what a file ending means.
 */
function checkIsScaffoldIgnored(absPath: string): boolean {
	scaffoldIgnoreMatchers ??= SCAFFOLD_IGNORE.map((pattern) =>
		micromatch.matcher(pattern, MICROMATCH_OPTIONS),
	)
	const relPath = toProjectRelativePath(absPath)
	return scaffoldIgnoreMatchers.some((isMatch) => isMatch(relPath))
}

/**
 * The message to print when a file's name spells its extension, or one of
 * the endings in `scripts/fileNames.ts` that mean something here, with capitals
 * — or `null` when the name is fine. `.stories` and `.story` count on any
 * extension; `.decorator` only on `.svelte`; `.component` only on `.ts` and
 * `.html`, and only in an Angular project, which is why the project's framework
 * is passed in.
 *
 * The patterns in this file each spell one name and mean one file, which is
 * safe because this check refuses an odd spelling and nothing is scaffolded
 * from it. Several of those patterns are evaluated before this check runs —
 * the watcher works out what kind of file it is looking at first — so it is
 * that nothing reads their answers until this check has had its chance to turn
 * the file away, rather than the ordering, that keeps them honest.
 *
 * The Storybook half of the message is only added for a story file. It fires on
 * any created file that clears the watcher's globs and isn't covered by
 * `scaffoldIgnore`, so a plain `Badge.VUE` would otherwise send its author off
 * to read their Storybook stories setting about a file that was never going to
 * appear there.
 */
function getWrongCasedNameError(absPath: string): string | null {
	const fileName = basename(absPath)
	const readyFileName = getNameWithLowerCasedEndings(fileName, {
		isAngularProject: getProjectFrameworkFamily() === 'angular',
	})
	if (readyFileName === fileName) return null
	const isStoryFile = STORY_FILE_REGEX.test(readyFileName)
	const storybookNote = isStoryFile
		? " Storybook matches its own stories setting exactly too, so a story file spelled with capitals never shows up there either."
		: ''
	return `"${rel(absPath)}" needs a lower-case ending — rename it to "${readyFileName}", and nothing was written for it. These endings are matched exactly.${storybookNote}`
}

/**
 * The message to print when a file's name can't become a name the generated
 * code could use — or `null` when it can.
 *
 * Whatever each framework's scaffolder trims off the file name first, what it
 * does with the rest is the same: `toPascalCase`, then the result goes in front
 * of `export function`, in the props type name, and in the name the story
 * imports. A router page named `[category].tsx` or `+page.svelte` therefore
 * used to produce files that don't parse, on every line that names the
 * component.
 *
 * This drops only the extension, via `basename`'s own suffix argument, so it
 * asks the question of the whole rest of the name rather than of whichever
 * part a given scaffolder would have used.
 * The endings are all plain letters and `toWords` treats a dot as a word break,
 * so `.stories` and Angular's `.component` can't change the answer either way.
 * A middle segment can: a hypothetical `Button.[id].decorator.svelte` is turned
 * away even though the decorator scaffolder would only have used `Button`.
 * That is the safe direction to be wrong in — nothing is written, and the line
 * below says why.
 *
 * It warns where the capitals check errors, because a bracketed page name is a
 * framework's own convention rather than a mistake — there is nothing to
 * correct, only a folder to leave alone.
 */
function getUnusableNameWarning(absPath: string): string | null {
	const nameWithoutExtension = basename(absPath, extname(absPath))
	// Named rather than tested inline, because the two forms are not
	// interchangeable and the line below prints the other one: the branch turns
	// on the PascalCase spelling, while the message quotes the name as the user
	// typed it, which is the one they can act on.
	const componentName = toPascalCase(nameWithoutExtension)
	if (CODE_NAME_REGEX.test(componentName)) return null
	return `left "${rel(absPath)}" alone — "${nameWithoutExtension}" can't be used as a component name in the generated code, so nothing was scaffolded for it. Page file names like "[id]" and "+page" are the usual reason; add a path pattern to scaffoldIgnore in your sb-deps config to stop this being mentioned.`
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
	const differentlyCasedName = getDifferentlyCasedName(builtPath)
	if (!differentlyCasedName) return true
	reportNamesClash(builtPath, differentlyCasedName)
	return false
}

/**
 * Tell the user their just-created file was left alone because of a name clash.
 *
 * Written once and reached from every decline that leaves the user's own file
 * untouched — a created story file, whether the clash was found on its
 * component or on another story naming, and a created Angular template.
 * Rewording this sentence has been most of the work in several review rounds,
 * and a reword landing at one site and not the others would tell different
 * stories about the same outcome.
 */
function warnFileLeftEmptyOverNameClash(absPath: string) {
	warn(
		`left "${rel(absPath)}" empty — nothing was written until the two names agree.`,
	)
}

/**
 * Say which two names clash. It is the sentence a reader acts on, so it is
 * written once and reached from everywhere that needs it: the checks on a
 * component name derived from a story's and on one derived from a template's,
 * the check on a story name derived from a component's, and the story lookup
 * when it settles on a name the folder spells differently.
 *
 * Note there is no check on a derived *template* name — that direction is
 * deliberately unchecked, for the reason given where the external template is
 * scaffolded.
 *
 * Deliberately not phrased as a count of those callers — that sentence has gone
 * stale here once already.
 */
function reportNamesClash(builtPath: string, onDiskName: string) {
	error(
		`looked for "${basename(builtPath)}" and found "${onDiskName}" in ${rel(dirname(builtPath))} — the two names differ only in capitals, so rename one of them to match the other.`,
	)
}

/** Does the folder hold this file name, whatever capitals it spells it with? */
function checkDoesFolderHoldName(
	fileName: string,
	folderEntries: ReadonlyArray<string>,
): boolean {
	const comparableName = fileName.toLowerCase()
	return folderEntries.some((entry) => entry.toLowerCase() === comparableName)
}

/**
 * The folder's own spelling of this name when it holds one differing only in
 * capitals, or `null` when it agrees, holds nothing like it, or can't be read.
 *
 * Separate from `checkDoesFolderAgreeWithName` so the callers that carry on
 * anyway — the Svelte decorator, and the story lookup, which only reports a
 * clash once it knows it is going to act on it — can decide for themselves what
 * to say.
 */
function getDifferentlyCasedName(
	builtPath: string,
	preReadEntries?: ReadonlyArray<string>,
): string | null {
	const entries = preReadEntries ?? readFolderEntriesOrNull(dirname(builtPath))
	if (!entries) return null
	const builtFileName = basename(builtPath)
	if (entries.includes(builtFileName)) return null
	const comparableFileName = builtFileName.toLowerCase()
	return (
		entries.find((entry) => entry.toLowerCase() === comparableFileName) ?? null
	)
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
 * The default `.tsx` component template, in the flavor `TSX_FRAMEWORK` selects.
 * React, Solid and Preact share the `.tsx` extension but need different code.
 */
function tsxComponentTemplate(
	flavor: TsxFramework,
	componentName: string,
	propsName: string,
): string {
	if (flavor === 'solid') {
		return `import { createSignal, mergeProps, type JSX } from 'solid-js'

export interface ${propsName} {
	text?: string
	children?: JSX.Element
}

export function ${componentName}(props: ${propsName}) {
	const mergedProps = mergeProps(
		{
			text: '${componentName}',
		} satisfies ${propsName},
		props,
	)
	const [count, setCount] = createSignal(0)

	return (
		<div class="${componentName}">
			<p>{mergedProps.text}</p>
			<button type="button" onClick={() => setCount(count() + 1)}>
				count: {count()}
			</button>
			{mergedProps.children}
		</div>
	)
}
`
	}
	// Preact props destructure exactly like React's, so both come from the one
	// template below.
	if (flavor === 'preact') {
		return reactLikeComponentTemplate({
			componentName,
			propsName,
			imports: `import type { ComponentChildren } from 'preact'\nimport { useState } from 'preact/hooks'\n`,
			childrenType: 'ComponentChildren',
			classAttribute: 'class',
		})
	}
	// Next.js renders the App Router tree on the server, and this tool scaffolds
	// straight into it. A module holding state has to say it is a client
	// component or the build refuses it as soon as a server component imports
	// it, so a Next.js project gets the directive and every other React project
	// gets a file without one. It is inert under the Pages Router, which is why
	// the framework alone decides it. Preact never reaches this line, so its
	// template above carries no directive.
	const clientDirective =
		getProjectFramework() === 'nextjs-webpack' ? "'use client'\n\n" : ''

	return reactLikeComponentTemplate({
		componentName,
		propsName,
		imports: `${clientDirective}import { useState, type ReactNode } from 'react'\n`,
		childrenType: 'ReactNode',
		classAttribute: 'className',
	})
}

interface ReactLikeComponentTemplateParams {
	/** PascalCase component name, e.g. `"ButtonAtom"` */
	componentName: string
	/** Props interface name, e.g. `"PropsForButtonAtom"` */
	propsName: string
	/**
	 * The import lines the file opens with, ending in a newline. React's is one
	 * line and may carry a leading `'use client'` directive; Preact's is two,
	 * because its state hook and its types come from different modules.
	 */
	imports: string
	/** What the `children` prop is typed as. */
	childrenType: string
	/** The attribute a class name goes in — React writes `className`, Preact `class`. */
	classAttribute: string
}

/**
 * The `.tsx` component template React and Preact both emit. The two frameworks
 * write the same component — destructured props with defaults, a counter, a
 * children slot — and differ only in the pieces named above, so the body is
 * written once here rather than twice.
 *
 * Solid is not written from this. Its component reads its props through
 * `mergeProps` instead of destructuring them, so it shares no body to speak of
 * and keeps its own template.
 */
function reactLikeComponentTemplate({
	componentName,
	propsName,
	imports,
	childrenType,
	classAttribute,
}: ReactLikeComponentTemplateParams): string {
	return `${imports}
export interface ${propsName} {
	text?: string
	children?: ${childrenType}
}

export function ${componentName}({
	text = '${componentName}',
	children,
}: ${propsName}) {
	const [count, setCount] = useState(0)

	return (
		<div ${classAttribute}="${componentName}">
			<p>{text}</p>
			<button type="button" onClick={() => setCount(count + 1)}>
				count: {count}
			</button>
			{children}
		</div>
	)
}
`
}

/**
 * The default `.tsx` story template. React, Solid and Preact stories are
 * identical apart from which package the Storybook types come from (see
 * `getTsxStoryTypesPackage`).
 *
 * The component is imported from `./${base}` (the actual filename), not
 * `./${componentName}` — the two differ for a non-PascalCase filename (e.g.
 * `button-atom.tsx` exports `ButtonAtom`), so keying the module path off the
 * symbol name would generate a broken import.
 */
function tsxStoryTemplate(
	flavor: TsxFramework,
	componentName: string,
	propsName: string,
	base: string,
	title: string,
	tags: Array<string>,
): string {
	const typesPackage = getTsxStoryTypesPackage(flavor)
	return `import type { Meta, StoryObj } from '${typesPackage}'
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
}

/**
 * The package a scaffolded `.tsx` story imports its Storybook types from. Solid
 * and Preact each have their own. React's depends on how the project builds: a
 * Next.js project's Storybook types live in `@storybook/nextjs`, not in the Vite
 * package, so importing the Vite one there produces a story that doesn't
 * type-check.
 */
function getTsxStoryTypesPackage(flavor: TsxFramework): string {
	if (flavor === 'solid') return 'storybook-solidjs-vite'
	if (flavor === 'preact') return '@storybook/preact-vite'
	if (getProjectFramework() === 'nextjs-webpack') return '@storybook/nextjs'
	return '@storybook/react-vite'
}

function scaffoldComponent(absCompPath: string) {
	const base = componentBaseFromComponent(absCompPath)
	const componentName = toPascalCase(base)
	const propsName = `PropsFor${componentName}`

	const override = SCAFFOLD_CONFIG?.[TSX_FRAMEWORK]?.component?.({
		componentName,
		propsName,
	})
	const tpl =
		override ?? tsxComponentTemplate(TSX_FRAMEWORK, componentName, propsName)
	writeFileSync(absCompPath, tpl, 'utf8')
	info(`scaffolded ${TSX_FRAMEWORK} component → ${rel(absCompPath)}`)
}

function scaffoldStoryForComponent(absCompPath: string, targetStoryPath: string) {
	const base = componentBaseFromComponent(absCompPath)
	const componentName = toPascalCase(base)
	const propsName = `PropsFor${componentName}`
	const title = makeTitleFromComponent(absCompPath, base)
	const atomic = detectAtomicTag(absCompPath)
	const tags = ['autodocs']
	if (atomic) tags.push(atomic)

	const override = SCAFFOLD_CONFIG?.[TSX_FRAMEWORK]?.story?.({
		componentName,
		propsName,
		title,
		tags,
		base,
	})
	const storyTpl =
		override ??
		tsxStoryTemplate(TSX_FRAMEWORK, componentName, propsName, base, title, tags)
	writeFileSync(targetStoryPath, storyTpl, 'utf8')
	info(`scaffolded ${TSX_FRAMEWORK} story → ${rel(targetStoryPath)}`)
	return targetStoryPath
}

/** A story already on disk: where it is, and whether it was found only by ignoring capitals. */
type ExistingStory = { path: string; isNamesClash: boolean }

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
): ExistingStory | null {
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

	// Every variant here is a name this tool worked out, so each has to be read
	// off the folder rather than probed with `isEmptyOrWhitespace` alone — that
	// asks the file system, which on Windows and macOS answers for
	// `Button.Story.tsx` when asked about `Button.story.tsx`. Taking that as a
	// hit would decline to write a story on the strength of a file Storybook's
	// own exact matching never indexes, and say nothing about why.
	const folderEntries = readFolderEntriesOrNull(dirname(canonicalStoryPath))
	// A folder that can't be listed must not read as "no story here": both
	// callers take that as leave to write, and the scaffolders write without
	// asking again, so a story already on disk would be replaced by a template.
	// Fall back to the plain probes, which fail the other way —
	// `isEmptyOrWhitespace` reports a file it cannot read as NOT empty.
	if (!folderEntries) {
		const foundPath = allVariants.find((path) => !isEmptyOrWhitespace(path))
		return foundPath ? { path: foundPath, isNamesClash: false } : null
	}
	// A variant the folder holds under different capitals is the same story to
	// the user, so it is considered alongside the ones spelled exactly. Matching
	// exactly on its own would find nothing and write a second story beside it.
	// Every variant, not just the canonical name, because the clash is just as
	// real under the `.story` spelling or Angular's `.component` one.
	//
	// A name the folder spells exactly wins over one it only spells with
	// different capitals, wherever each sits in the variant order. Otherwise a
	// user with a real duplicate — an exactly-spelled `Foo.story.ts` beside the
	// `Foo.stories.ts` being built — could be sent to fix a capitals clash on
	// some other variant instead of the duplicate actually in front of them.
	//
	// The emptiness rule applies to both alike: an empty file is not a story
	// whatever it is called, so it must not suppress the write.
	const spelledExactly = allVariants.filter((path) =>
		folderEntries.includes(basename(path)),
	)
	const foundExactly = spelledExactly.find(
		(path) => !isEmptyOrWhitespace(path),
	)
	if (foundExactly) return { path: foundExactly, isNamesClash: false }

	const clashingVariants = allVariants.flatMap((builtPath) => {
		const onDiskName = getDifferentlyCasedName(builtPath, folderEntries)
		if (!onDiskName) return []
		return [{ builtPath, onDiskName, path: join(dirname(builtPath), onDiskName) }]
	})
	// Reported only here, once it is settled that this is the story being used.
	const foundClashing = clashingVariants.find(
		(variant) => !isEmptyOrWhitespace(variant.path),
	)
	if (!foundClashing) return null
	reportNamesClash(foundClashing.builtPath, foundClashing.onDiskName)
	return { path: foundClashing.path, isNamesClash: true }
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
		text?: string;
		children?: Snippet;
	}

	const { text = '${componentName}', children }: PropsFor${componentName} = $props();

	let count = $state(0);
</script>

<div class="${componentName}">
	<p>{text}</p>
	<button type="button" onclick={() => count++}>
		count: {count}
	</button>
	{@render children?.()}
</div>

<style>
	.${componentName} {
		/* styles go here */
	}
</style>
`
	writeFileSync(absCompPath, tpl, 'utf8')
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
	// This is the one derived name that is reported but not refused, and the
	// reason is recoverability rather than when scaffolding runs. Nothing here
	// is scaffolded on save — every branch of the watcher fires on creation —
	// but an empty *story* still gets filled later, because `findExistingStory`
	// counts only a non-empty file, so creating the component once the clash is
	// fixed writes into it. A decorator has no second file whose creation comes
	// back for it, so refusing would leave one that only deleting and
	// re-creating could ever fill.
	const componentImportPath = `${wrappedBase}.svelte`
	const wrappedComponentPath = join(
		dirname(absDecoratorPath),
		componentImportPath,
	)
	// Looked up before the write, said after it — the sentences below claim the
	// file was written, so they must not be printed by a run that then fails to
	// write one.
	const folderEntries = readFolderEntriesOrNull(dirname(absDecoratorPath))
	const differentlyCasedName = getDifferentlyCasedName(
		wrappedComponentPath,
		folderEntries ?? undefined,
	)
	// `wrappedBase` is the part of the name before the FIRST dot, because a
	// middle segment names a variant of the wrapped component by design —
	// `Button.Primary.decorator.svelte` decorates `Button`. A component whose
	// own name carries a dot reads the same way, so `Table.Row.decorator.svelte`
	// is taken to decorate `Table` and imports a file that may not exist.
	//
	// That ambiguity is inherent in the naming convention, so this says what it
	// did rather than trying to guess which reading was meant. Two names derived
	// from the decorator's own — the one it imports, and the fuller one just
	// below — both looked up in the folder listing already read above. Neither
	// is a general check of what a written file imports.
	const isWrappedComponentMissing =
		!!folderEntries &&
		!differentlyCasedName &&
		!folderEntries.includes(componentImportPath)
	// Whether the dot is what actually stands in the way, decided by what is on
	// disk rather than by the shape of the name.
	//
	// `Table.Row.decorator.svelte` and `Button.Primary.decorator.svelte` are
	// indistinguishable as names — both wrap whatever precedes the first dot.
	// But the dot only blocks a remedy when the component the fuller name spells
	// is sitting right there: for a real `Table.Row.svelte` there is nothing the
	// user can rename to reach it, while `Button.Primary.decorator.svelte` with
	// no `Button.Primary.svelte` is just a decorator written before its
	// component, and creating `Button.svelte` is a perfectly good answer.
	// Matched however the folder capitalises it, the same way
	// `getDifferentlyCasedName` matches for the wrapped component above — a
	// `table.row.svelte` beside this decorator is the same clash to the user.
	// The ending itself is matched exactly: `getWrongCasedNameError` has already
	// turned away anything but a lower-case `.decorator`.
	const fullBaseWithoutDecorator = fullBase.replace(/\.decorator$/, '')
	const isWrappedNameAmbiguous =
		!!folderEntries &&
		fullBaseWithoutDecorator !== wrappedBase &&
		checkDoesFolderHoldName(`${fullBaseWithoutDecorator}.svelte`, folderEntries)

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
	writeFileSync(absDecoratorPath, tpl, 'utf8')
	info(`scaffolded svelte decorator → ${rel(absDecoratorPath)}`)
	// Its own message, not the shared clash line: that one is written for the
	// callers that abort, so it would tell the reader to rename a file that
	// isn't there and imply nothing was written.
	//
	// The two endings hang off one opening because they describe one thing —
	// what the decorator now imports — differing only in what the folder turned
	// out to hold. Written separately, the shared half drifts.
	const wrappedComponentNote = getWrappedComponentNote(
		differentlyCasedName,
		isWrappedComponentMissing,
		isWrappedNameAmbiguous,
	)
	if (wrappedComponentNote) {
		warn(
			`"${rel(absDecoratorPath)}" was written importing "./${componentImportPath}"${wrappedComponentNote}`,
		)
	}
}

/**
 * What to add about the component a decorator was written to import, or `''`
 * when the folder holds it under exactly that name and there is nothing to say.
 *
 * The missing case has two shapes and they want different things said. Most of
 * the time the decorator simply arrived first — `Button.decorator.svelte` with
 * no `Button.svelte` yet — and the useful line is the actionable one: create it
 * or point the decorator elsewhere.
 *
 * The other shape only arises when the decorator's own name has a middle
 * segment, because a decorator wraps whatever is named before the first dot and
 * a middle segment names a variant. `Button.Primary.decorator.svelte` decorates
 * `Button` by design, and `Table.Row.decorator.svelte` reads identically — so
 * beside a real `Table.Row.svelte` neither remedy exists: no decorator name can
 * produce it, and the `Table.svelte` being asked for is not the component they
 * meant. Only that shape is told about the dot; saying it to someone who simply
 * has not written their component yet is a non-sequitur.
 */
function getWrappedComponentNote(
	differentlyCasedName: string | null,
	isWrappedComponentMissing: boolean,
	isWrappedNameAmbiguous: boolean,
): string {
	if (differentlyCasedName)
		return `, but the folder holds "${differentlyCasedName}" — that import works on Windows and macOS and fails everywhere else until the two names match.`
	if (!isWrappedComponentMissing) return ''
	if (!isWrappedNameAmbiguous)
		return `, and there is no such file beside it — create it, or rename the decorator after a component that is.`
	return `, and there is no such file beside it. A decorator wraps whatever is named before its first dot, so this is the only component it can ask for — one whose own name carries a dot cannot be wrapped this way.`
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
</script>

<Story name="Primary" args={{} satisfies PropsFor${componentName}}>
	<p>${title}</p>
</Story>
`
	writeFileSync(targetStoryPath, storyTpl, 'utf8')
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
import { ref } from 'vue'

export interface PropsFor${componentName} {
	text?: string
}

const { text = '${componentName}' } = defineProps<PropsFor${componentName}>()

const count = ref(0)
</script>

<template>
	<div class="${componentName}">
		<p>{{ text }}</p>
		<button type="button" @click="count++">count: {{ count }}</button>
		<slot />
	</div>
</template>
`
	writeFileSync(absCompPath, tpl, 'utf8')
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
	writeFileSync(targetStoryPath, storyTpl, 'utf8')
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
 * An inline `template:` block with the indentation every line shares removed,
 * and the blank lines at its top and tail dropped.
 *
 * The block is written indented inside the `@Component` decorator, so all of
 * that shared depth has to come off before it can stand on its own in a
 * `.component.html` file. Trimming instead takes the leading whitespace off the
 * FIRST line only and leaves every later line as it was — which reads as the
 * opening element being the parent of the siblings that follow it, and
 * `normalizeHtmlIndentation` then preserves that reading rather than fixing it.
 */
function stripSharedIndentation(html: string): string {
	const lines = html.split('\n')
	while (lines.length > 0 && !lines[0].trim()) lines.shift()
	while (lines.length > 0 && !lines[lines.length - 1].trim()) lines.pop()

	const contentLineIndents = lines
		.filter((line) => line.trim())
		.map((line) => line.match(/^[ \t]*/)?.[0] ?? '')
	if (contentLineIndents.length === 0) return lines.join('\n')

	// The prefix every line literally begins with, not the shortest indent by
	// length. A block mixing tabs and spaces has lines whose indents are the
	// same length while sharing no characters, so measuring by length picks one
	// of them and slices that many characters off the others — cutting into
	// indentation the line needed, and nesting an element under a sibling.
	const sharedIndent = contentLineIndents.reduce(getSharedPrefix)
	return lines.map((line) => line.slice(sharedIndent.length)).join('\n')
}

/** The leading characters that both strings begin with. */
function getSharedPrefix(a: string, b: string): string {
	let sharedLength = 0
	while (
		sharedLength < a.length &&
		sharedLength < b.length &&
		a[sharedLength] === b[sharedLength]
	) {
		sharedLength++
	}
	return a.slice(0, sharedLength)
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

/**
 * The markup for a scaffolded `.component.html`.
 *
 * `isWrittenBesideDefaultClass` says whether the class this file will be
 * rendered by is the one this tool just wrote from its own default template.
 * Only then may the markup read `text()` and `count`, because that same
 * scaffold is what declared them. Anywhere else the markup has to stand on its
 * own, or the file just written fails the build naming members the class never
 * declared — so this is false where the class is known to be someone else's,
 * which means a `scaffold.angular.component` override supplied it, and equally
 * where it simply cannot be told, which is the safe answer either way.
 */
function defaultAngularHtmlTemplate(
	componentName: string,
	isWrittenBesideDefaultClass: boolean,
) {
	const defaultBody = isWrittenBesideDefaultClass
		? `${getAngularTemplateBody('')}\n`
		: `<p>${componentName}</p>\n<ng-content />\n`

	return (
		SCAFFOLD_CONFIG?.angular?.componentHtml?.({ componentName }) ?? defaultBody
	)
}

/**
 * The markup an Angular scaffold renders for a component it wrote itself.
 * Shared by the inline `template:` and by the separate `.html` file when that
 * file is written beside the default class, so those two spell the same thing
 * — a `componentHtml` override still replaces the `.html` file alone, which is
 * what that option has always meant. Failing such an override, an `.html` file
 * written beside any other class gets binding-free markup instead; see
 * `defaultAngularHtmlTemplate`.
 *
 * `indent` is prepended to every line: the file copy sits at the left margin,
 * the inline copy two tabs deep inside the `@Component` decorator. The markup
 * itself is written at the margin so it reads as markup rather than as a piece
 * of source that has to be mentally de-indented.
 */
function getAngularTemplateBody(indent: string): string {
	const body = `<p>{{ text() }}</p>
<button type="button" (click)="count.set(count() + 1)">
	count: {{ count() }}
</button>
<ng-content />`

	return body
		.split('\n')
		.map((line) => `${indent}${line}`)
		.join('\n')
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
	let isDefaultClassWritten = false

	if (isEmptyOrWhitespace(tsPath)) {
		// The two template locations produce the same component apart from this
		// one property, so the rest of the file is written once.
		const templateProperty =
			templateLocation === 'external'
				? `\ttemplateUrl: './${base}.component.html',`
				: `\ttemplate: \`\n${getAngularTemplateBody('\t\t')}\n\t\`,`
		const defaultTsTpl = `import { Component, input, signal } from '@angular/core';

@Component({
	selector: '${selector}',
	host: { '[class]': '["${componentName}", class()].join(" ")' },
${templateProperty}
	standalone: true,
	imports: [],
})
export class ${className} {
	class = input<string>('');
	text = input<string>('${componentName}');

	count = signal(0);
}
`
		const overrideTsTpl = SCAFFOLD_CONFIG?.angular?.component?.({
			componentName,
			className,
			selector,
			base,
			templateLocation,
		})
		writeFileSync(tsPath, overrideTsTpl ?? defaultTsTpl, 'utf8')
		// The default class is the only one this call KNOWS declares the `text`
		// and `count` the default markup reads, so the template written below
		// can only bind when this wrote it. An override's class is the user's
		// own, and a `.ts` already on disk was not written here — either may
		// happen to declare them, and nothing here can tell.
		//
		// Compared against null rather than tested for truthiness, to match the
		// `??` above: an override returning an empty string supplied the file,
		// so the class is still not ours.
		isDefaultClassWritten = overrideTsTpl == null
		info(`scaffolded angular component → ${rel(tsPath)}`)
	}

	// Only scaffold the HTML file when using an external template.
	//
	// No capitals check here, unlike the other names this tool works out: the
	// only path that reaches an external template starts from a just-created
	// `.component.html`, and this rebuilds that same name from that same file,
	// so the folder always holds it under this exact spelling and the check
	// could never say no. A `Button.Component.html` that appears while the
	// watcher is NOT running is not covered here or anywhere — while it is
	// running, a checkout or a copy arrives as a creation like any other and is
	// turned away by the name check, except on a file system that tells
	// capitals apart, where the glob never matches it. See the naming section
	// of the README.
	if (templateLocation === 'external') {
		const htmlPath = join(dir, `${base}.component.html`)
		if (isEmptyOrWhitespace(htmlPath)) {
			writeFileSync(
				htmlPath,
				defaultAngularHtmlTemplate(componentName, isDefaultClassWritten),
				'utf8',
			)
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
				const deIndentedTemplate = stripSharedIndentation(match[1])
				const extractedHtml =
					normalizeHtmlIndentation(deIndentedTemplate) + '\n'
				// Write the `.html` BEFORE swapping the `.ts` over to templateUrl,
				// so a failed write at either step still leaves the template in at
				// least one of the two files. The reverse order would strip it out
				// of the `.ts` and then lose it entirely if the `.html` write threw.
				writeFileSync(absHtmlPath, extractedHtml, 'utf8')
				isHtmlWritten = true
				info(`scaffolded angular template → ${rel(absHtmlPath)}`)
				// Swap template: `...` → templateUrl in the .ts file
				const updated = tsContent.replace(
					/template:\s*`[\s\S]*?`/,
					`templateUrl: './${base}.component.html'`,
				)
				writeFileSync(absTsPath, updated, 'utf8')
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
	//
	// Binding-free, because nothing here establishes which class the markup will
	// be rendered by, and the ways of arriving pull in both directions.
	//
	// A component written by hand reaches this whenever its template is in a
	// shape the regex above does not match — quoted rather than backticked, say
	// — and there markup reading `text()` or `count` would fail the build
	// naming members that class never wrote.
	//
	// But a component this tool wrote reaches it too, and its class declares
	// both: an external scaffold is given `templateUrl` from the start, a
	// migration rewrites an inline template to `templateUrl`, and either leaves
	// nothing for the regex to find — so deleting the `.html` to start the
	// markup over lands here. The failed-read path above arrives the same way.
	//
	// Nothing distinguishes them at this point, so both get the safe answer.
	// The cost where the class did declare the members is the demonstration
	// only, which is the right way round.
	if (!isHtmlWritten) {
		writeFileSync(
			absHtmlPath,
			defaultAngularHtmlTemplate(componentName, false),
			'utf8',
		)
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
	writeFileSync(targetStoryPath, storyTpl, 'utf8')
	info(`scaffolded angular story → ${rel(targetStoryPath)}`)
	return targetStoryPath
}

// ───────────────────────────────────────────────────────────────────────────────
// Story-file creation (mirror of component creation)
// ───────────────────────────────────────────────────────────────────────────────
// The scaffold "families" that own their own story file, keyed into
// STORY_SCAFFOLDERS below. Derived from the scaffold-config keys minus `solid`
// and `preact`: both share the `.tsx` extension with React, so neither has a
// story-file family of its own — they ride the `react` family and only their
// template text differs (see `getFrameworkFamily` and `TSX_FRAMEWORK`). Adding a
// genuinely new framework to the scaffold config expands this union and makes
// STORY_SCAFFOLDERS fail to compile until its scaffolder trio is added.
type StoryFramework = Exclude<
	keyof NonNullable<SbDepsConfig['scaffold']>,
	'solid' | 'preact'
>

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
		// Solid and Preact components are `.tsx` too, so both resolve and build
		// component paths exactly like React — they ride the `react` family. Only
		// the emitted template text differs, chosen by `TSX_FRAMEWORK`.
		case 'solid-vite':
		case 'preact-vite':
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
 * written — a story already exists, the name it would take clashes with one
 * already there under different capitals, or that name is one the config asked
 * to be left alone.
 *
 * The component is not checked against the config here: every caller reaches
 * this with a path that has already been through `checkIsScaffoldIgnored` —
 * the four framework branches with the created file itself, and the Angular
 * template branch with the component name it worked out.
 */
function ensureStoryFor(
	framework: StoryFramework,
	absCompPath: string,
): string | null {
	const { storyPath, story } = STORY_SCAFFOLDERS[framework]
	const canonicalStoryPath = storyPath(absCompPath)
	if (findExistingStory(canonicalStoryPath, framework)) return null
	// The story is a name this tool works out, so the config has to be asked
	// about it in its own right — the component being fair game says nothing
	// about the story beside it. Only a pattern naming files rather than a
	// folder can tell the two apart, which is exactly what the README's
	// `**/*.stories.tsx`-shaped examples are.
	//
	// After the lookup above, so this only speaks when a story really would
	// have been written. Asked before it, the same config would announce that
	// nothing was written for a component whose story is already sitting there.
	//
	// Said rather than done silently: the component the user created is
	// untouched and perfectly fine, so a story simply never appearing would
	// look like the watcher had missed it.
	if (checkIsScaffoldIgnored(canonicalStoryPath)) {
		warn(
			`no story written for "${rel(absCompPath)}" — the name it would take, "${rel(canonicalStoryPath)}", is covered by scaffoldIgnore.`,
		)
		return null
	}
	// Nothing above was worth reusing, so this name is about to be written to.
	// That is a narrower question than the one just asked, and it needs asking
	// separately: an EMPTY file under this name with different capitals is
	// correctly not a story, so it doesn't stop the lookup — but it is still a
	// file this write would land on or beside, and the two names still have to
	// agree before anything is written.
	if (!checkDoesFolderAgreeWithName(canonicalStoryPath)) return null
	return story(absCompPath, canonicalStoryPath)
}

/**
 * Work out the component a created story file belongs to, and which framework's
 * scaffolders to use. `.tsx` → React, Solid or Preact, `.svelte` → Svelte,
 * `.ts` → React, Solid, Preact, Vue, or Angular (disambiguated in
 * `resolveTsStoryComponent`). Every framework that writes `.tsx` shares that
 * route, and they are told apart by `tsxFramework`.
 * Any extension with no entry in `STORY_COMPONENT_RESOLVERS` returns `null` —
 * not something we scaffold.
 */
function resolveComponentForStory(
	absStoryPath: string,
): { compPath: string; framework: StoryFramework } | null {
	const byExtension = getComponentForStoryByExtension(absStoryPath)
	if (!byExtension) return null
	// The component is worked out from the story's name, so a config that leaves
	// the component alone has to stop here too. What that saves depends on what
	// is already on disk: with no component yet, filling this story would go on
	// to write the very file the config asked this tool not to write; with one
	// already there, the story would be a story for a component the config says
	// to leave alone. Neither is wanted, so this declines without needing to
	// know which case it is in — and the line it prints says only what it did.
	//
	// Only reachable with a pattern naming files rather than folders, since a
	// story and its component always share a directory. It says something rather
	// than staying silent the way an ignored path does, because the file left
	// empty is the story the user just created, which is not the ignored one —
	// and Storybook reports an empty story file as having no exports.
	if (checkIsScaffoldIgnored(byExtension.compPath)) {
		warn(
			`left "${rel(absStoryPath)}" empty — its component "${rel(byExtension.compPath)}" is covered by scaffoldIgnore, so no story was written for it.`,
		)
		return null
	}
	// The component's name is worked out from the story's, so it has to clear the
	// capitals check before anything is done with it. A story named with
	// different capitals to its component pairs with it silently on Windows and
	// macOS, and scaffolds a second component beside it everywhere else.
	if (!checkDoesFolderAgreeWithName(byExtension.compPath)) {
		// The story file the user just created stays on disk and empty, and it
		// still matches Storybook's globs, so Storybook reports a file with no
		// exports. Say so here, the same way the duplicate-story decline does —
		// the name-clash line on its own explains the clash but not what
		// happened to the file in front of them.
		warnFileLeftEmptyOverNameClash(absStoryPath)
		return null
	}
	return byExtension
}

/**
 * How a created story file finds its component, keyed by the story's own
 * extension. Its keys ARE the set of extensions a story can be scaffolded
 * from, which is why `checkIsScaffoldableStoryFile` below reads them straight
 * off it: a hand-written second copy of that set could fall out of step with
 * these branches, and the drift is silent in the direction that matters — an
 * extension resolvable here but missing from the set would skip the
 * unusable-name check and go on to write the broken name this whole change
 * exists to prevent.
 *
 * A `.mdx`, `.js`, `.jsx` or `.vue` story clears the watcher's globs and reads
 * as a story file, but has no entry here, so nothing is ever written for one.
 *
 * `.tsx` and `.svelte` name a framework, so a stray one in a non-matching
 * project is turned away with a warning rather than backfilled as the wrong
 * framework. `.ts` names none itself and is worked out separately — its
 * sibling lookup runs the same check, since a sibling can name any framework.
 */
const STORY_COMPONENT_RESOLVERS: Record<
	string,
	(
		storyBase: string,
		absStoryPath: string,
	) => { compPath: string; framework: StoryFramework } | null
> = {
	'.tsx': (storyBase, absStoryPath) => {
		if (!checkDoesFileFrameworkMatchProject('react', absStoryPath)) return null
		// Through the shared helper, so the react spelling has one owner. (The
		// `.svelte` entry below can't: the helper has no Svelte spelling, since a
		// `.ts` story can't scaffold one.)
		const compPath = getComponentPathForFamily(storyBase, 'react')
		if (!compPath) return null
		return { compPath, framework: 'react' }
	},
	'.svelte': (storyBase, absStoryPath) => {
		if (!checkDoesFileFrameworkMatchProject('svelte', absStoryPath)) return null
		return { compPath: `${storyBase}.svelte`, framework: 'svelte' }
	},
	'.ts': (storyBase, absStoryPath) =>
		resolveTsStoryComponent(storyBase, absStoryPath),
}

/**
 * Is a created story file at this path one the scaffolder could fill at all?
 * Only those get the unusable-name check, so that it never blames a file's
 * name for an outcome its name had nothing to do with.
 *
 * Two questions, because `.ts` needs both. There has to be a resolver for the
 * extension, and for `.ts` the project's own framework has to be one a `.ts`
 * story can name. Two kinds of project fail that: a Svelte one, where a
 * sibling can only come from another framework and there is no Svelte spelling
 * to fall back to; and one whose framework was never recognised, which is any
 * framework this tool has no support for. A `.ts` story in either produces
 * nothing whatever it is called, so saying its name was the reason would be
 * untrue.
 *
 * A `.tsx` or `.svelte` story in a project of the other framework stays a
 * candidate, and the reason is the name rather than the message. Its name
 * really would have stopped it even in a matching project, so the line it
 * prints is true — which is the opposite of the `.ts` case, where the
 * framework is the blocker and the name is blameless. Note what that costs:
 * candidacy gates the name check alone, and the name check ends the event, so
 * a `.tsx` story with an unusable name in a Vue project is told about its name
 * and never told about the mismatch. Nothing is written either way, so the
 * choice is only about which true thing gets said first.
 */
function checkIsScaffoldableStoryFile(absStoryPath: string): boolean {
	const extension = extname(absStoryPath)
	if (!Object.hasOwn(STORY_COMPONENT_RESOLVERS, extension)) return false
	if (extension !== '.ts') return true
	const projectFamily = getProjectFrameworkFamily()
	// The same set a `.ts` story can name through a sibling, reused rather than
	// spelled again — `getComponentPathForFamily` answers for exactly these.
	return !!projectFamily && TS_STORY_SIBLING_FAMILIES.includes(projectFamily)
}

/** The `resolveComponentForStory` answer before the capitals check, chosen by the story file's extension. */
function getComponentForStoryByExtension(
	absStoryPath: string,
): { compPath: string; framework: StoryFramework } | null {
	const storyBase = absStoryPath.replace(STORY_FILE_REGEX, '')
	const resolveComponent = STORY_COMPONENT_RESOLVERS[extname(absStoryPath)]
	if (!resolveComponent) return null
	return resolveComponent(storyBase, absStoryPath)
}

/**
 * A `.stories.ts` story can be React, Solid, Preact, Vue, or Angular — all of
 * them use `.ts` story files (the React, Solid and Preact scaffolded templates
 * are JSX-free, so they're valid as `.ts` even though all three write stories as
 * `.tsx` by convention). Prefer an existing sibling component to decide
 * (`<base>.tsx` → React, Solid or Preact, told apart by `tsxFramework`;
 * `<base>.vue` → Vue; `<base>.component.ts` → Angular); with none present,
 * fall back to the project's detected framework. Svelte is intentionally excluded: its story
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
		//
		// Which "why" depends on what was found. A story under a genuinely
		// different naming is a duplicate, and deleting one of the pair is the
		// fix. One found only by ignoring capitals is not a duplicate — the
		// clash line already printed says to make the two names agree, and
		// telling them to delete a file as well would be a second, contrary
		// instruction about the same pair.
		if (existingStory.isNamesClash) {
			warnFileLeftEmptyOverNameClash(absStoryPath)
		} else {
			warn(
				`left "${rel(absStoryPath)}" empty — "${rel(existingStory.path)}" is already the story for this component. Delete whichever one you don't want.`,
			)
		}
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
						// ignores capitals, so on Linux these globs match exactly and
						// four odd spellings match none of them: a capitalised extension
						// (`Gadget.TSX`), an Angular template (`Button.Component.html`),
						// a story outside the source folder, and a `.Stories.mdx`. Those
						// are dropped here, before the check, and nothing reports them —
						// the graph filter can't either, since dependency-cruiser scans a
						// fixed lower-case extension list inside the source folder only.
						// The README's naming section carries the same four; keep the
						// two together. Widening every glob unconditionally is not the
						// answer: it would also make `Src/` match a `srcDir` of `src` on
						// a file system where those really are two folders.
						if (!includeMatchers.some((isMatch) => isMatch(relPath))) continue

						if (ev.type === 'delete') {
							console.log('Deleted:', relPath)
							kick('unlink', abs)
							continue
						}

						// Everything between here and the rebuild at the bottom only runs
						// on creation, and all of it is scaffolding. The three questions
						// it asks of the path are asked once each, here, because the name
						// check below needs all three to know whether this file is one
						// the scaffolder would have touched at all — and asking again
						// further down would mean the same regex work twice per event.
						// `isCreate` guards each one, so the update events that dominate
						// while editing still skip the path work entirely.
						const isCreate = ev.type === 'create'
						const componentBranch = isCreate
							? COMPONENT_CREATE_BRANCHES.find((branch) =>
									branch.checkIsMatch(relPath),
								)
							: undefined
						const isStoryCreate = isCreate && isStoryFileUnderSrc(relPath)
						const isAngularHtmlCreate =
							isCreate && isComponentsAngularHtml(relPath)
						// Is this a file the scaffolder would have done anything with?
						// The name check below is only worth making for those: a plain
						// `.ts` file matches the watcher's globs but no scaffolder, so
						// SvelteKit's `+page.server.ts` would otherwise be told its name
						// is unusable for a purpose it was never put to.
						//
						// A story file needs the narrower question, not `isStoryCreate`.
						// That one asks whether the name reads as a story, which a
						// `.mdx`, `.js`, `.jsx` or `.vue` story does — but nothing was
						// going to be written for one whatever it was called. The same
						// goes for a `.ts` story in a project whose framework cannot
						// host one: a Svelte project, or any whose framework this tool
						// does not recognise.
						const isScaffoldCandidate =
							!!componentBranch ||
							(isStoryCreate && checkIsScaffoldableStoryFile(abs)) ||
							isAngularHtmlCreate

						// Told to leave this path alone, so nothing below runs and
						// nothing is said — including the two naming messages, which
						// exist only to explain why nothing was scaffolded. The rebuild
						// still fires, so an ignored page keeps its place in the graph
						// and still shows what it is built with.
						if (isCreate && checkIsScaffoldIgnored(abs)) {
							kick(ev.type, abs)
							continue
						}

						// Every check past this point spells one name and means one
						// file, so a name that could be read two ways is turned away
						// here rather than half-understood further in. The rebuild still
						// fires: the file is real, and leaving it out of the graph until
						// its next save would be worse than including it — the same
						// reasoning as the framework-mismatch fall-through below.
						const nameError = isCreate ? getWrongCasedNameError(abs) : null
						if (nameError) {
							error(nameError)
							kick(ev.type, abs)
							continue
						}

						// A name this tool can read, but not one it can write into the
						// files it generates. It goes after the capitals check because
						// that one hands back a spelling to rename to, which is the more
						// useful thing to read first when a name has both problems.
						const unusableNameWarning = isScaffoldCandidate
							? getUnusableNameWarning(abs)
							: null
						if (unusableNameWarning) {
							warn(unusableNameWarning)
							kick(ev.type, abs)
							continue
						}

						// STORY CREATE — fill the story (and its component if missing).
						// Limited to SRC_DIR like the component-create branches below, so a story
						// created outside SRC_DIR never scaffolds a component there.
						// Falls through to the normal rebuild when there's nothing to
						// scaffold (non-empty story, or an extension we don't template).
						if (isStoryCreate) {
							if (handleStoryCreation(abs)) continue
						}

						// COMPONENT CREATE — scaffold if empty and ensure story. Only
						// scaffolds when the file's extension matches the project's
						// framework; a mismatch is ignored + warned inside
						// `checkDoesFileFrameworkMatchProject`.
						//
						// On a framework mismatch, fall through to the normal rebuild at
						// the bottom rather than `continue` — the file is still a real
						// source file, so skipping it would leave the graph stale until
						// its next save. (The match check logs its own warning.) The `if`
						// below tests only `isScaffoldableComponent`, which already
						// includes the branch-matched check — and `componentBranch` is
						// only looked up on creation, so that covers the event type too.
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

						// ANGULAR .component.html CREATE
						// A mismatch here falls through to the normal rebuild below, same
						// reasoning as the component branches above. The match check logs
						// its own warning, so keep it out of an inline `&&` chain where
						// that would be easy to miss.
						const isScaffoldableAngularHtml =
							isAngularHtmlCreate &&
							checkDoesFileFrameworkMatchProject('angular', abs)
						if (isScaffoldableAngularHtml) {
							// Named after the template, so it goes through the capitals
							// check. This is the component direction; the template
							// direction — a template name rebuilt from a component's — is
							// the one derived name deliberately left unchecked, for the
							// reason given where the external template is scaffolded.
							const tsPath = angularComponentTsPath(abs)
							// The component name is worked out from the template's, so the
							// config has to be asked about it too. Both arms below act on
							// this component — one writes it, the other writes the template
							// beside it and gives it a story — so a component the config
							// leaves alone stops the branch outright. Again only a pattern
							// naming files can separate the two, since the pair share a
							// directory.
							if (checkIsScaffoldIgnored(tsPath)) {
								warn(
									`left "${rel(abs)}" alone — the component it belongs to, "${rel(tsPath)}", is covered by scaffoldIgnore.`,
								)
								kick(ev.type, abs)
								continue
							}
							if (!checkDoesFolderAgreeWithName(tsPath)) {
								// Say what became of the file they created, the way the
								// other two decline paths do. The clash line above names
								// the component, which is a file they never touched.
								//
								// Only when it really is empty. The other two reach their
								// decline through a caller that has already returned on a
								// non-empty file, so they can assert it; this branch is
								// entered on any created template, and a user who pasted
								// one in still has everything they wrote.
								if (isEmptyOrWhitespace(abs)) {
									warnFileLeftEmptyOverNameClash(abs)
								}
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
							// Same reasoning as the component branch above, and it matters
							// more here: this arm may already have written the template and
							// rewritten the component to point at it, so with a story
							// already on disk nothing else would rebuild and the graph
							// would show the state from before that change.
							kick(ev.type, abs)
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

	// `storybookFileExtension` and `tsxFramework` come from a config file that
	// isn't type-checked at runtime (a JS config can hold any value), so validate
	// each against its known set — warn and fall back to the default for anything
	// unrecognised, the same way `srcDir` is handled above.
	STORYBOOK_FILE_EXTENSION = validateConfigChoice<StorybookFileExtension>(
		'storybookFileExtension',
		cfg.storybookFileExtension,
		['story', 'stories'],
		'stories',
	)
	// The fallback follows the detected framework rather than always being
	// `react`, so a Solid or Preact project that never got the config key still
	// scaffolds its own templates instead of silently writing React ones into it.
	TSX_FRAMEWORK = validateConfigChoice<TsxFramework>(
		'tsxFramework',
		cfg.tsxFramework,
		['react', 'solid', 'preact'],
		tsxFrameworkFromFramework(getProjectFramework()),
	)

	// Same treatment as the two options above, for the same reason: a JS config
	// file can hold any value. An entry that is empty or only spaces would
	// match nothing useful and reads as a mistake rather than a pattern, so the
	// whole list is refused rather than quietly dropping the bad entry — a
	// half-applied ignore list is harder to notice than one that isn't applied.
	const configuredScaffoldIgnore = cfg.scaffoldIgnore
	const isScaffoldIgnoreUsable =
		Array.isArray(configuredScaffoldIgnore) &&
		configuredScaffoldIgnore.every(
			(pattern) => typeof pattern === 'string' && pattern.trim() !== '',
		)
	if (configuredScaffoldIgnore === undefined) {
		SCAFFOLD_IGNORE = []
	} else if (isScaffoldIgnoreUsable) {
		// Trimmed on the way in, the same way `srcDir` is. The check above only
		// asks whether an entry has something in it once trimmed, so a pattern
		// written with a stray space — `'src/routes/** '` — would otherwise be
		// accepted and then match nothing at all, which gives the user a
		// configured option that silently does nothing.
		SCAFFOLD_IGNORE = configuredScaffoldIgnore.map((pattern) => pattern.trim())
	} else {
		error(
			`scaffoldIgnore is invalid — must be an array of path patterns, each a non-empty string (e.g. ['src/routes/**']). Carrying on with no patterns, so nothing is left alone.`,
		)
		SCAFFOLD_IGNORE = []
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
