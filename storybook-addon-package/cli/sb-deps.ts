#!/usr/bin/env node

/* eslint-disable no-console */
import watcherParcel from '@parcel/watcher'
import micromatch from 'micromatch'
import { execFileSync, spawn, type ChildProcess } from 'node:child_process'
import {
	existsSync,
	mkdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from 'node:fs'
import { createRequire } from 'node:module'
import { basename, dirname, extname, join, posix, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import type { SbDepsConfig } from '../src/config.js'
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
const projectRoot = process.cwd()
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
	if (cachedProjectFramework === null)
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
	// The empty-srcDir case (project root *is* the source folder) needs a
	// different shape: anchoring on `^/` would still walk node_modules, so
	// switch to a node_modules denylist via negative lookahead that rejects
	// `node_modules` as any path segment — covers nested
	// `packages/foo/node_modules/...` paths in monorepos, not just the
	// top-level folder.
	const includeOnly =
		SRC_DIR === ''
			? '^(?!(?:[^/]*/)*node_modules/)'
			: `^${SRC_DIR.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`
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

function isEmptyOrWhitespace(absPath: string) {
	try {
		const s = statSync(absPath)
		if (s.size === 0) return true
		const txt = readFileSync(absPath, 'utf8')
		return !txt.trim()
	} catch {
		return true
	}
}

/**
 * Build a regex that matches `<SRC_DIR>/...<suffix>` for the scaffolding-trigger
 * helpers below. `SRC_DIR` is interpolated at call time (these helpers run
 * inside the watcher event loop, after the boot block has loaded the config
 * and finalised `SRC_DIR`).
 *
 * Files don't have to live under a `components/` subfolder — same philosophy
 * as the postprocess filter: any source file under `srcDir` with the right
 * extension is a candidate. The framework-agnostic story-file exclusion
 * (`STORY_FILE_REGEX`) is applied separately in the individual helpers.
 */
function srcSubpathRegex(suffixPattern: string): RegExp {
	// Empty SRC_DIR (project root *is* the source folder) means there is no
	// subfolder gate — match any path that ends with the given suffix. The
	// watcher's ignore list (node_modules, .git, dist, build) keeps the noise
	// out before paths ever reach here, so a permissive regex is fine.
	if (SRC_DIR === '') {
		return new RegExp(`.+${suffixPattern}`, 'i')
	}
	const escapedSrcDir = SRC_DIR.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	return new RegExp(`(?:^|\\/)${escapedSrcDir}\\/.+${suffixPattern}`, 'i')
}

/**
 * Matches story files in any framework: `.story.<ext>` or `.stories.<ext>`
 * where `<ext>` is any single-segment file extension (`.svelte`, `.ts`, `.tsx`,
 * `.js`, `.jsx`, `.mdx`, …). Used by the scaffolding-trigger helpers to make
 * sure they don't try to auto-scaffold a story file for an existing story.
 */
const STORY_FILE_REGEX = /\.stor(?:y|ies)\.\w+$/i

// <srcDir>/**/Thing.story.<ext> or Thing.stories.<ext> ? Gates story-file
// scaffolding to the configured source dir, mirroring the component detectors
// below. The story watcher globs match any directory (so out-of-src stories
// still trigger a graph rebuild), but scaffolding a story — and backfilling its
// component — should only fire under SRC_DIR, exactly like component-driven
// creation, so a root-level `stories/Foo.stories.tsx` never writes `Foo.tsx`
// into a non-source folder.
function isStoryFileUnderSrc(absPath: string) {
	const norm = absPath.replace(/\\/g, '/')
	return srcSubpathRegex('\\.stor(?:y|ies)\\.\\w+$').test(norm)
}

// <srcDir>/**/Thing.tsx ? (and not a story file)
function isComponentsTsx(absPath: string) {
	const norm = absPath.replace(/\\/g, '/')
	return srcSubpathRegex('\\.tsx$').test(norm) && !STORY_FILE_REGEX.test(norm)
}

// <srcDir>/**/Thing.svelte ? (and not a story file)
function isComponentsSvelte(absPath: string) {
	const norm = absPath.replace(/\\/g, '/')
	return (
		srcSubpathRegex('\\.svelte$').test(norm) && !STORY_FILE_REGEX.test(norm)
	)
}

// <srcDir>/**/Thing.decorator.svelte ?
function isDecoratorSvelte(absPath: string) {
	const norm = absPath.replace(/\\/g, '/')
	return srcSubpathRegex('\\.decorator\\.svelte$').test(norm)
}

// <srcDir>/**/Thing.vue ? (and not a story file)
function isComponentsVue(absPath: string) {
	const norm = absPath.replace(/\\/g, '/')
	return srcSubpathRegex('\\.vue$').test(norm) && !STORY_FILE_REGEX.test(norm)
}

// <srcDir>/**/Thing.component.ts ?
function isComponentsAngularTs(absPath: string) {
	const norm = absPath.replace(/\\/g, '/')
	return srcSubpathRegex('\\.component\\.ts$').test(norm)
}

// <srcDir>/**/Thing.component.html ?
function isComponentsAngularHtml(absPath: string) {
	const norm = absPath.replace(/\\/g, '/')
	return srcSubpathRegex('\\.component\\.html$').test(norm)
}

function componentBaseFromComponent(absCompPath: string) {
	return basename(absCompPath, '.tsx')
}

function componentBaseFromSvelteComponent(absCompPath: string) {
	return basename(absCompPath, '.svelte')
}

function componentBaseFromVueComponent(absCompPath: string) {
	return basename(absCompPath, '.vue')
}

function componentBaseFromAngularComponent(absCompPath: string) {
	return basename(absCompPath).replace(/\.component\.(ts|html)$/i, '')
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

function makeTitleFromComponent(absCompPath: string) {
	const srcRoot = join(projectRoot, SRC_DIR) + sep
	const normAbs = absCompPath.replace(/\\/g, '/')
	const relFromSrc = normAbs.startsWith(srcRoot.replace(/\\/g, '/'))
		? normAbs.slice(srcRoot.length)
		: absCompPath.replace(projectRoot + sep, '').replace(/\\/g, '/')

	const dir = posix.dirname(relFromSrc)
	let segments = dir.split('/').filter(Boolean)
	if (segments[0] && /^components?$/i.test(segments[0]))
		segments = segments.slice(1)

	const titledFolders = segments.map((s) => toTitleCase(toWords(s)))
	const compName = componentBaseFromComponent(absCompPath)
	const compTitle = toTitleCase(toWords(compName))

	const fullStoryPath = [...titledFolders, compTitle].filter(Boolean)

	// remove duplicates (e.g. Folder/Thing/Thing => Folder/Thing)
	const dedupedStoryPath = [...new Set(fullStoryPath)]

	return dedupedStoryPath.join(' / ')
}

// ───────────────────────────────────────────────────────────────────────────────
// Story & component scaffolding
// ───────────────────────────────────────────────────────────────────────────────
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
	writeFileSync(absCompPath, tpl, 'utf8')
	info(`scaffolded component → \${rel(absCompPath)}`)
}

function scaffoldStoryForComponent(
	absCompPath: string,
	targetStoryPath: string = storyPathForComponent(absCompPath),
) {
	const base = componentBaseFromComponent(absCompPath)
	const componentName = toPascalCase(base)
	const propsName = `PropsFor${componentName}`
	const title = makeTitleFromComponent(absCompPath)
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
import { ${componentName}, type ${propsName} } from './${componentName}'

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
	writeFileSync(targetStoryPath, storyTpl, 'utf8')
	info(`scaffolded story → \${rel(targetStoryPath)}`)
	return targetStoryPath
}

/**
 * Return the on-disk story file for `canonicalStoryPath` if one already exists —
 * under either the `.stories.<ext>` or the `.story.<ext>` naming. The canonical
 * path is built from `STORYBOOK_FILE_EXTENSION`, which may itself be either
 * variant, so both directions are checked. Used by `ensureStoryFor` so
 * auto-creating a component never emits a duplicate story when the sibling
 * was created under the other naming.
 */
function findExistingStory(canonicalStoryPath: string): string | null {
	if (existsSync(canonicalStoryPath)) return canonicalStoryPath
	const alternateStoryPath = getAlternateStoryNaming(canonicalStoryPath)
	if (alternateStoryPath && existsSync(alternateStoryPath))
		return alternateStoryPath
	return null
}

/** Swap a story path between its `.story.<ext>` and `.stories.<ext>` naming. */
function getAlternateStoryNaming(storyPath: string): string | null {
	if (/\.story\.\w+$/i.test(storyPath))
		return storyPath.replace(/\.story\.(\w+)$/i, '.stories.$1')
	if (/\.stories\.\w+$/i.test(storyPath))
		return storyPath.replace(/\.stories\.(\w+)$/i, '.story.$1')
	return null
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
	writeFileSync(absCompPath, tpl, 'utf8')
	info(`scaffolded svelte component → ${rel(absCompPath)}`)
}

function scaffoldSvelteDecorator(absDecoratorPath: string) {
	const fullBase = componentBaseFromSvelteComponent(absDecoratorPath)
	const wrappedBase = fullBase.split('.')[0] ?? fullBase
	const componentName = toPascalCase(wrappedBase)

	const tpl =
		SCAFFOLD_CONFIG?.svelte?.decorator?.({ componentName }) ??
		`<script lang="ts">
	import ${componentName} from "./${componentName}.svelte";

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
}

function makeTitleFromSvelteComponent(absCompPath: string) {
	const srcRoot = join(projectRoot, SRC_DIR) + sep
	const normAbs = absCompPath.replace(/\\/g, '/')
	const relFromSrc = normAbs.startsWith(srcRoot.replace(/\\/g, '/'))
		? normAbs.slice(srcRoot.length)
		: absCompPath.replace(projectRoot + sep, '').replace(/\\/g, '/')

	const dir = posix.dirname(relFromSrc)
	let segments = dir.split('/').filter(Boolean)
	if (segments[0] && /^components?$/i.test(segments[0]))
		segments = segments.slice(1)

	const titledFolders = segments.map((s) => toTitleCase(toWords(s)))
	const compName = componentBaseFromSvelteComponent(absCompPath)
	const compTitle = toTitleCase(toWords(compName))

	const fullStoryPath = [...titledFolders, compTitle].filter(Boolean)

	// remove duplicates (e.g. Folder/Thing/Thing => Folder/Thing)
	const dedupedStoryPath = [...new Set(fullStoryPath)]

	return dedupedStoryPath.join(' / ')
}

function scaffoldStoryForSvelteComponent(
	absCompPath: string,
	targetStoryPath: string = storyPathForSvelteComponent(absCompPath),
) {
	const base = componentBaseFromSvelteComponent(absCompPath)
	const componentName = toPascalCase(base)
	const title = makeTitleFromSvelteComponent(absCompPath)
	const atomic = detectAtomicTag(absCompPath)
	const tags = ['autodocs']
	if (atomic) tags.push(atomic)

	const storyTpl =
		SCAFFOLD_CONFIG?.svelte?.story?.({ componentName, title, tags }) ??
		`<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews'
	import ${componentName}, { type PropsFor${componentName} } from './${componentName}.svelte'
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
	writeFileSync(absCompPath, tpl, 'utf8')
	info(`scaffolded vue component → ${rel(absCompPath)}`)
}

function makeTitleFromVueComponent(absCompPath: string) {
	const srcRoot = join(projectRoot, SRC_DIR) + sep
	const normAbs = absCompPath.replace(/\\/g, '/')
	const relFromSrc = normAbs.startsWith(srcRoot.replace(/\\/g, '/'))
		? normAbs.slice(srcRoot.length)
		: absCompPath.replace(projectRoot + sep, '').replace(/\\/g, '/')

	const dir = posix.dirname(relFromSrc)
	let segments = dir.split('/').filter(Boolean)
	if (segments[0] && /^components?$/i.test(segments[0]))
		segments = segments.slice(1)

	const titledFolders = segments.map((s) => toTitleCase(toWords(s)))
	const compName = componentBaseFromVueComponent(absCompPath)
	const compTitle = toTitleCase(toWords(compName))

	const fullStoryPath = [...titledFolders, compTitle].filter(Boolean)

	// remove duplicates (e.g. Folder/Thing/Thing => Folder/Thing)
	const dedupedStoryPath = [...new Set(fullStoryPath)]

	return dedupedStoryPath.join(' / ')
}

function scaffoldStoryForVueComponent(
	absCompPath: string,
	targetStoryPath: string = storyPathForVueComponent(absCompPath),
) {
	const base = componentBaseFromVueComponent(absCompPath)
	const componentName = toPascalCase(base)
	const title = makeTitleFromVueComponent(absCompPath)
	const atomic = detectAtomicTag(absCompPath)
	const tags = ['autodocs']
	if (atomic) tags.push(atomic)

	const storyTpl =
		SCAFFOLD_CONFIG?.vue?.story?.({ componentName, title, tags }) ??
		`import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import ${componentName}, { type PropsFor${componentName} } from './${componentName}.vue'

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

function makeTitleFromAngularComponent(absCompPath: string) {
	const srcRoot = join(projectRoot, SRC_DIR) + sep
	const normAbs = absCompPath.replace(/\\/g, '/')
	const relFromSrc = normAbs.startsWith(srcRoot.replace(/\\/g, '/'))
		? normAbs.slice(srcRoot.length)
		: absCompPath.replace(projectRoot + sep, '').replace(/\\/g, '/')

	const dir = posix.dirname(relFromSrc)
	let segments = dir.split('/').filter(Boolean)
	if (segments[0] && /^components?$/i.test(segments[0]))
		segments = segments.slice(1)

	const titledFolders = segments.map((s) => toTitleCase(toWords(s)))
	const compName = componentBaseFromAngularComponent(absCompPath)
	const compTitle = toTitleCase(toWords(compName))

	const fullStoryPath = [...titledFolders, compTitle].filter(Boolean)

	// remove duplicates (e.g. Folder/Thing/Thing => Folder/Thing)
	const dedupedStoryPath = [...new Set(fullStoryPath)]

	return dedupedStoryPath.join(' / ')
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
	const htmlPath = join(dir, `${base}.component.html`)

	if (!existsSync(tsPath) || isEmptyOrWhitespace(tsPath)) {
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
		writeFileSync(tsPath, tsTpl, 'utf8')
		info(`scaffolded angular component → ${rel(tsPath)}`)
	}

	// Only scaffold the HTML file when using an external template
	if (
		templateLocation === 'external' &&
		(!existsSync(htmlPath) || isEmptyOrWhitespace(htmlPath))
	) {
		writeFileSync(htmlPath, defaultAngularHtmlTemplate(componentName), 'utf8')
		info(`scaffolded angular template → ${rel(htmlPath)}`)
	}
}

function scaffoldAngularHtmlFromTs(absHtmlPath: string, absTsPath: string) {
	const base = componentBaseFromAngularComponent(absHtmlPath)
	const componentName = toPascalCase(base)

	let htmlContent: string | null = null

	// Try to extract inline template from the existing .ts file
	if (existsSync(absTsPath) && !isEmptyOrWhitespace(absTsPath)) {
		const tsContent = readFileSync(absTsPath, 'utf8')
		const match = tsContent.match(/template:\s*`([\s\S]*?)`/)
		if (match) {
			htmlContent = normalizeHtmlIndentation(match[1].trim()) + '\n'
			// Swap template: `...` → templateUrl in the .ts file
			const updated = tsContent.replace(
				/template:\s*`[\s\S]*?`/,
				`templateUrl: './${base}.component.html'`,
			)
			writeFileSync(absTsPath, updated, 'utf8')
			info(`updated angular component to use templateUrl → ${rel(absTsPath)}`)
		}
	}

	// Fall back to default scaffold
	if (htmlContent === null) {
		htmlContent = defaultAngularHtmlTemplate(componentName)
	}

	writeFileSync(absHtmlPath, htmlContent, 'utf8')
	info(`scaffolded angular template → ${rel(absHtmlPath)}`)
}

function scaffoldStoryForAngularComponent(
	absCompPath: string,
	targetStoryPath: string = storyPathForAngularComponent(absCompPath),
) {
	const base = componentBaseFromAngularComponent(absCompPath)
	const componentName = toPascalCase(base)
	const className = `${componentName}Component`
	const title = makeTitleFromAngularComponent(absCompPath)
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
type StoryFramework = 'react' | 'svelte' | 'vue' | 'angular'

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
		story: (compPath: string, targetStoryPath?: string) => string
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
 * created. Returns the scaffolded story path, or `null` if one already existed.
 */
function ensureStoryFor(
	framework: StoryFramework,
	absCompPath: string,
): string | null {
	const { storyPath, story } = STORY_SCAFFOLDERS[framework]
	if (findExistingStory(storyPath(absCompPath))) return null
	return story(absCompPath)
}

/**
 * Work out the component a created story file belongs to, and which framework's
 * scaffolders to use. `.tsx` → React, `.svelte` → Svelte, `.ts` → Vue or Angular
 * (disambiguated in `resolveTsStoryComponent`). Any other extension (`.js`,
 * `.jsx`, `.mdx`) returns `null` — not something we scaffold.
 */
function resolveComponentForStory(
	absStoryPath: string,
): { compPath: string; framework: StoryFramework } | null {
	const storyBase = absStoryPath.replace(STORY_FILE_REGEX, '')
	const ext = extname(absStoryPath).toLowerCase()
	if (ext === '.tsx') return { compPath: `${storyBase}.tsx`, framework: 'react' }
	if (ext === '.svelte')
		return { compPath: `${storyBase}.svelte`, framework: 'svelte' }
	if (ext === '.ts') return resolveTsStoryComponent(storyBase)
	return null
}

/**
 * A `.stories.ts` story is Vue or Angular. Prefer an existing sibling component
 * to decide (`<base>.vue` → Vue, `<base>.component.ts` → Angular); with neither
 * present, fall back to the project's detected framework.
 */
function resolveTsStoryComponent(
	storyBase: string,
): { compPath: string; framework: StoryFramework } | null {
	const vuePath = `${storyBase}.vue`
	if (existsSync(vuePath)) return { compPath: vuePath, framework: 'vue' }
	const angularPath = `${storyBase}.component.ts`
	if (existsSync(angularPath))
		return { compPath: angularPath, framework: 'angular' }
	const projectFramework = getProjectFramework()
	if (projectFramework === 'vue3-vite')
		return { compPath: vuePath, framework: 'vue' }
	if (projectFramework === 'angular-webpack')
		return { compPath: angularPath, framework: 'angular' }
	return null
}

/**
 * Fill a directly-created story file (the mirror of component creation). Skips
 * non-empty files (an existing story is never clobbered) and stories whose
 * framework/extension we don't scaffold. When the sibling component is missing,
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
	const { component: scaffoldFrameworkComponent, story: scaffoldFrameworkStory } =
		STORY_SCAFFOLDERS[framework]
	const isComponentMissing =
		!existsSync(compPath) || isEmptyOrWhitespace(compPath)
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
	let isDeletingFile = false

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

	return watcherParcel
		.subscribe(
			root,
			async (err, events) => {
				if (err) {
					error(`watch error ${err?.message || err}`)
					return
				}

				for (const ev of events) {
					const abs = ev.path
					const relPath = rel(abs)
					if (!micromatch.isMatch(relPath, includeGlobs)) continue

					if (ev.type === 'delete') {
						console.log('Deleted:', relPath)
						isDeletingFile = true
						kick('unlink', abs)
						continue
					}

					// STORY CREATE — fill the story (and its component if missing).
					// Src-gated like the component-create branches below, so a story
					// created outside SRC_DIR never scaffolds a component there.
					// Falls through to the normal rebuild when there's nothing to
					// scaffold (non-empty story, or an extension we don't template).
					if (isStoryFileUnderSrc(abs) && ev.type === 'create') {
						if (handleStoryCreation(abs)) continue
					}

					// COMPONENT CREATE — scaffold if empty and ensure story
					if (isComponentsTsx(abs) && ev.type === 'create') {
						await handleComponentCreation(abs, relPath)
						continue
					}

					// SVELTE COMPONENT CREATE — scaffold if empty and ensure story
					if (isComponentsSvelte(abs) && ev.type === 'create') {
						await handleSvelteComponentCreation(abs, relPath)
						continue
					}

					// VUE COMPONENT CREATE — scaffold if empty and ensure story
					if (isComponentsVue(abs) && ev.type === 'create') {
						await handleVueComponentCreation(abs, relPath)
						continue
					}

					// ANGULAR .component.ts CREATE — scaffold with inline template
					if (isComponentsAngularTs(abs) && ev.type === 'create') {
						await handleAngularComponentCreation(abs, relPath, 'internal')
						continue
					}

					// ANGULAR .component.html CREATE
					if (isComponentsAngularHtml(abs) && ev.type === 'create') {
						const tsPath = angularComponentTsPath(abs)
						if (existsSync(tsPath) && !isEmptyOrWhitespace(tsPath)) {
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
		if (isDecoratorSvelte(abs)) {
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
	// remove the projectRoot prefix and normalize slashes for logs
	const prefix = resolve(projectRoot) + sep
	return p.replace(prefix, '')
}
function ms(n: number) {
	return `${Math.max(1, Math.round(n))}ms`
}
function info(msg: string) {
	console.log('[sb-deps]', msg)
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
