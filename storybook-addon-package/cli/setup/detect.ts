import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { stripCommentsRespectingStrings } from './util.js'

import type { SbDepsConfig } from '../../src/config.js'

export type Framework =
	| 'react-vite'
	| 'preact-vite'
	| 'sveltekit'
	| 'svelte-vite'
	| 'vue3-vite'
	| 'solid-vite'
	| 'angular-webpack'
	| 'nextjs-webpack'
	| 'unsupported'
	| 'unknown'

export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun'

export type MainFile = {
	path: string
	lang: 'ts' | 'js' | 'mjs' | 'cjs'
}

export type PreviewFile = {
	path: string
	lang: 'ts' | 'tsx' | 'js' | 'jsx'
}

export type FrameworkDetectionSource = 'package.json' | '.storybook/main' | 'none'

export type Detection = {
	storybookDir: string
	mainFile: MainFile | null
	previewFile: PreviewFile | null
	framework: Framework
	frameworkRaw: string | null
	frameworkDetectionSource: FrameworkDetectionSource
	bundler: 'vite' | 'webpack5' | 'unknown'
	packageManager: PackageManager
	isEsm: boolean
	/**
	 * Names of every package present in `dependencies` or `devDependencies`
	 * of the project's package.json. Used by the wizard's install step to
	 * skip packages the user already has, and could be used by future steps
	 * that need to gate behaviour on a particular dep being present.
	 *
	 * Does NOT include `peerDependencies` — a peer dep is a contract the
	 * consumer is *supposed* to provide, not something already installed.
	 */
	installedPackages: ReadonlySet<string>
}

const MAIN_CANDIDATES: ReadonlyArray<MainFile['lang']> = [
	'ts',
	'mjs',
	'js',
	'cjs',
]
const PREVIEW_CANDIDATES: ReadonlyArray<PreviewFile['lang']> = [
	'tsx',
	'ts',
	'jsx',
	'js',
]

function findMainFile(storybookDir: string): MainFile | null {
	for (const lang of MAIN_CANDIDATES) {
		const path = resolve(storybookDir, `main.${lang}`)
		if (existsSync(path)) return { path, lang }
	}
	return null
}

function findPreviewFile(storybookDir: string): PreviewFile | null {
	for (const lang of PREVIEW_CANDIDATES) {
		const path = resolve(storybookDir, `preview.${lang}`)
		if (existsSync(path)) return { path, lang }
	}
	return null
}

function detectPackageManager(cwd: string): PackageManager {
	let dir = cwd
	while (true) {
		if (existsSync(resolve(dir, 'pnpm-lock.yaml'))) return 'pnpm'
		if (existsSync(resolve(dir, 'yarn.lock'))) return 'yarn'
		if (
			existsSync(resolve(dir, 'bun.lock')) ||
			existsSync(resolve(dir, 'bun.lockb'))
		)
			return 'bun'
		if (existsSync(resolve(dir, 'package-lock.json'))) return 'npm'
		const parent = dirname(dir)
		if (parent === dir) break
		dir = parent
	}
	return 'npm'
}

const FRAMEWORK_REGEX =
	/framework\s*:\s*(?:\{\s*name\s*:\s*['"]([^'"]+)['"]|['"]([^'"]+)['"])/

/**
 * Maps the **core framework package** (e.g. `react`, `@angular/core`,
 * `@sveltejs/kit`) declared in the consumer's `package.json` to the
 * corresponding `@storybook/<framework>` value that `frameworkFromRaw` knows
 * how to map.
 *
 * Why core packages and not `@storybook/<framework>`: a minimal Storybook
 * install does not necessarily pull in a framework-specific Storybook package
 * (Storybook can be wired up without one, or with the framework picked at
 * runtime), so scanning for `@storybook/react-vite` etc. is unreliable. The
 * core framework package, on the other hand, is always present in any project
 * that actually uses that framework — the project literally can't run without
 * it.
 *
 * **Meta-framework subsumption** (`subsumes`): when both a meta-framework's
 * core package and a base framework's core package are present in deps (e.g.
 * `next` + `react`, `@sveltejs/kit` + `svelte`, eventually `nuxt` + `vue`),
 * the meta-framework wins because it's more specific — the base package is
 * just its transitive dep. Encoded explicitly via `subsumes` rather than
 * relying on array ordering, so the scan can also tell the difference between
 * "subsumed" (meta + base, meta wins) and "independent" (two unrelated
 * frameworks both present — e.g. `vue` + `react` in a polyglot monorepo),
 * which gets returned as ambiguous so the caller falls back to the
 * `.storybook/main.*` regex.
 *
 * Array order is now purely a human-readable convention (meta-frameworks
 * listed above their base): it carries no logic.
 *
 * This list is the input to the `package.json` scan only. It is NOT a gate on
 * the regex path: the regex captures any `framework:` string literal it finds
 * in `.storybook/main.*`, and `frameworkFromRaw` is what decides whether the
 * matched string is recognised.
 */
const CORE_FRAMEWORK_DETECTORS: ReadonlyArray<{
	corePackage: string
	framework: string
	/**
	 * Core package this detector subsumes when both are present in deps —
	 * i.e. the more-general framework that this one builds on top of. A
	 * `next` match subsumes a `react` match because Next.js pulls in React;
	 * `@sveltejs/kit` subsumes `svelte`; future `nuxt` will subsume `vue`.
	 */
	subsumes?: string
}> = [
	{ corePackage: '@angular/core', framework: '@storybook/angular' },
	{ corePackage: 'next', framework: '@storybook/nextjs', subsumes: 'react' },
	{
		corePackage: '@sveltejs/kit',
		framework: '@storybook/sveltekit',
		subsumes: 'svelte',
	},
	{ corePackage: 'svelte', framework: '@storybook/svelte-vite' },
	// Nuxt detector (`{ corePackage: 'nuxt', framework: '@storybook/nuxt',
	// subsumes: 'vue' }`) will slot in here in the follow-up Nuxt PR. The
	// `subsumes` field is what makes Nuxt win over Vue when both are present.
	{ corePackage: 'vue', framework: '@storybook/vue3-vite' },
	{ corePackage: 'react', framework: '@storybook/react-vite' },
	// Preact subsumes nothing and is subsumed by nothing: it does not build on
	// React the way Next.js does, so a project holding both `preact` and `react`
	// is genuinely ambiguous rather than one framework wrapping the other, and
	// falls through to the `.storybook/main.*` regex — which is the reliable
	// answer there. A Preact project that redirects React imports to Preact by
	// aliasing the `react` dependency lands in exactly that case, and the regex
	// settles it.
	{ corePackage: 'preact', framework: '@storybook/preact-vite' },
	// Solid's Storybook framework is the community package `storybook-solidjs-vite`
	// (not under the `@storybook/` scope). It's an independent framework — nothing
	// subsumes it and it subsumes nothing.
	{ corePackage: 'solid-js', framework: 'storybook-solidjs-vite' },
]

function frameworkFromRaw(raw: string | null): Framework {
	if (!raw) return 'unknown'
	if (raw === '@storybook/react-vite') return 'react-vite'
	if (raw === '@storybook/preact-vite') return 'preact-vite'
	if (raw === '@storybook/sveltekit') return 'sveltekit'
	if (raw === '@storybook/svelte-vite') return 'svelte-vite'
	if (raw === '@storybook/vue3-vite') return 'vue3-vite'
	// Solid uses the community `storybook-solidjs-vite` package (Vite-only).
	if (raw === 'storybook-solidjs-vite') return 'solid-vite'
	// `@storybook/angular` is webpack5-only today. Reserving the bare `'angular'`
	// framework value for the future Vite-based Angular Storybook framework if it
	// ships — current Angular goes in as `'angular-webpack'`.
	if (raw === '@storybook/angular') return 'angular-webpack'
	if (raw === '@storybook/nextjs') return 'nextjs-webpack'
	return 'unsupported'
}

/**
 * Scan a project's full dependency surface (deps + devDeps + peerDeps) for
 * recognised core framework packages and return the unambiguous winner's
 * `@storybook/<framework>` value, or `null` if no recognised package is
 * present *or* if the result is ambiguous (caller falls back to the
 * `.storybook/main.*` regex).
 *
 * The decision is two-pass:
 *
 *  1. Collect every detector whose `corePackage` is in deps.
 *  2. For each meta-framework match with a `subsumes` field, drop the
 *     subsumed core's match (e.g. `next` match drops `react` match;
 *     `@sveltejs/kit` drops `svelte`; future `nuxt` will drop `vue`).
 *
 * If exactly one match survives, that's the winner. Zero matches → no
 * recognised framework. **Multiple unrelated matches** (e.g. a polyglot
 * monorepo with both `vue` and `react` in the dep surface) → ambiguous, so
 * return `null` and let the `.storybook/main.*` regex decide based on the
 * explicit `framework:` declaration. Without this ambiguity check the scan
 * would silently pick whichever detector happened to come first in the
 * array, which is fragile and produced exactly that bug for `vue` + `react`
 * before this fix.
 */
function findFrameworkInDeps(
	allDependencyKeys: ReadonlySet<string>,
): string | null {
	const matches = CORE_FRAMEWORK_DETECTORS.filter((d) =>
		allDependencyKeys.has(d.corePackage),
	)
	if (matches.length === 0) return null
	const subsumedCores = new Set(
		matches.map((m) => m.subsumes).filter((s): s is string => !!s),
	)
	const survivors = matches.filter((m) => !subsumedCores.has(m.corePackage))
	if (survivors.length === 1) return survivors[0]!.framework
	// Zero (every match was subsumed, which can only happen if a detector
	// `subsumes` is its own corePackage — guard anyway) or multiple
	// independent matches → ambiguous; let the regex path decide.
	return null
}

function bundlerFromFramework(framework: Framework): Detection['bundler'] {
	switch (framework) {
		case 'react-vite':
		case 'preact-vite':
		case 'sveltekit':
		case 'svelte-vite':
		case 'vue3-vite':
		case 'solid-vite':
			return 'vite'
		case 'angular-webpack':
		case 'nextjs-webpack':
			return 'webpack5'
		default:
			return 'unknown'
	}
}

/**
 * Which set of `.tsx` templates a project wants — the value of the
 * `tsxFramework` config key. Derived from the config schema so the two can't
 * drift apart.
 */
export type TsxFramework = NonNullable<SbDepsConfig['tsxFramework']>

/**
 * Which `.tsx` templates a detected framework wants. React, Solid and Preact
 * all author components in `.tsx`, so the file extension alone can't tell them
 * apart and the framework has to answer for it.
 *
 * The single place that answer lives. The scaffolder uses it for the value it
 * falls back to when the `tsxFramework` config key is absent, and the setup
 * wizard uses it for the value it writes into that key — a copy each is how the
 * two would come to disagree about the same project.
 *
 * Everything else is React. That is the right answer for React itself and for
 * Next.js, the only others here that author `.tsx` at all. For the rest the
 * value is never consulted: a `.tsx` file in a Svelte, Vue or Angular project
 * is turned away before any template is chosen, and one in a project whose
 * framework was never recognised is not scaffolded either.
 */
export function tsxFrameworkFromFramework(framework: Framework): TsxFramework {
	if (framework === 'solid-vite') return 'solid'
	if (framework === 'preact-vite') return 'preact'
	return 'react'
}

/**
 * The Vite-based frameworks the wizard fully supports (detection + preview
 * patching). The list itself, written once — the type below is derived from it
 * and the predicate reads it, so adding a framework is one line here rather
 * than the same set restated wherever it is needed and kept in step by hand.
 *
 * `as const` is what gives the members their literal types so the union can be
 * derived; `satisfies` is what still checks each one against `Framework`, so a
 * typo here is a compile error rather than a new member of the union.
 *
 * The order is the order the wizard offers them in when it has to ask, since
 * that is the only place a reader meets them as a list.
 */
export const SUPPORTED_FRAMEWORKS = [
	'react-vite',
	'preact-vite',
	'vue3-vite',
	'sveltekit',
	'svelte-vite',
	'solid-vite',
] as const satisfies ReadonlyArray<Framework>

/**
 * A framework the wizard fully supports. A type predicate below narrows
 * `Framework` to this set — the single source of truth the preview patcher's
 * support guard reuses instead of re-listing the members.
 */
export type SupportedFramework = (typeof SUPPORTED_FRAMEWORKS)[number]

export function isFrameworkSupported(
	framework: Framework,
): framework is SupportedFramework {
	// Widened to read the caller's type: `includes` on the literal array would
	// only accept a value already known to be one of its members, which is the
	// question being asked rather than something the caller can promise.
	const supportedFrameworks: ReadonlyArray<Framework> = SUPPORTED_FRAMEWORKS
	return supportedFrameworks.includes(framework)
}

export function detectProject(cwd: string): Detection {
	const storybookDir = resolve(cwd, '.storybook')
	const mainFile = findMainFile(storybookDir)
	const previewFile = findPreviewFile(storybookDir)

	let isEsm = false
	let installedPackages: ReadonlySet<string> = new Set<string>()
	let allDependencyKeys: ReadonlySet<string> = new Set<string>()
	try {
		const pkg = JSON.parse(readFileSync(resolve(cwd, 'package.json'), 'utf8'))
		isEsm = pkg.type === 'module'
		const installed = {
			...(pkg.dependencies ?? {}),
			...(pkg.devDependencies ?? {}),
		}
		installedPackages = new Set(Object.keys(installed))
		// `allDependencyKeys` additionally includes peerDependencies — used only
		// for framework detection. Apps typically declare their core framework
		// (`react`, `@angular/core`, etc.) in deps/devDeps, but intermediate
		// packages (component libraries, shared UI kits) declare it as a peer
		// dep instead. Including peerDeps lets the wizard work in both cases.
		allDependencyKeys = new Set([
			...Object.keys(installed),
			...Object.keys(pkg.peerDependencies ?? {}),
		])
	} catch {
		// no package.json or unreadable — leave defaults (empty sets)
	}

	// Primary signal: scan the project's dependency surface for exactly one
	// recognised Storybook framework package. This works even when the
	// `.storybook/main.*` config file is missing (minimal setups) or formatted
	// in a way the regex below can't parse.
	let frameworkRaw: string | null = findFrameworkInDeps(allDependencyKeys)
	let frameworkDetectionSource: FrameworkDetectionSource =
		frameworkRaw ? 'package.json' : 'none'

	// Fallback: regex-match the `.storybook/main.*` config file. Runs when the
	// dependency scan above found nothing it recognised, and also when it could
	// not choose between independent matches — `findFrameworkInDeps` returns
	// null for both, and the explicit `framework:` declaration is the reliable
	// answer in the second case. A meta-framework and the base it
	// `subsumes` are not one of those cases: that pair resolves in the scan.
	if (frameworkRaw === null && mainFile) {
		try {
			const content = readFileSync(mainFile.path, 'utf8')
			// Strip comments first so a commented-out `framework: ...` example
			// (or a code snippet inside a block comment) can't be detected as the
			// active framework.
			const codeOnly = stripCommentsRespectingStrings(content)
			const match = codeOnly.match(FRAMEWORK_REGEX)
			const matched = match?.[1] || match?.[2] || null
			if (matched) {
				frameworkRaw = matched
				frameworkDetectionSource = '.storybook/main'
			}
		} catch {
			// leave frameworkRaw as null
		}
	}

	const framework = frameworkFromRaw(frameworkRaw)
	const bundler = bundlerFromFramework(framework)

	return {
		storybookDir,
		mainFile,
		previewFile,
		framework,
		frameworkRaw,
		frameworkDetectionSource,
		bundler,
		packageManager: detectPackageManager(cwd),
		isEsm,
		installedPackages,
	}
}
