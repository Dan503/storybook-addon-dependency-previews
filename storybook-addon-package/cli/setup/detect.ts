import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { stripCommentsRespectingStrings } from './util.js'

export type Framework =
	| 'react-vite'
	| 'sveltekit'
	| 'svelte-vite'
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
 * **Order matters — first match wins.** Frameworks that pull in another
 * framework as a transitive dependency must appear *before* that other
 * framework so the more-specific detection wins:
 *
 * - Next.js depends on `react`, so check `next` first.
 * - SvelteKit depends on `svelte`, so check `@sveltejs/kit` first.
 *
 * This list is the input to the `package.json` scan only. It is NOT a gate on
 * the regex path: the regex captures any `framework:` string literal it finds
 * in `.storybook/main.*`, and `frameworkFromRaw` is what decides whether the
 * matched string is recognised.
 */
const CORE_FRAMEWORK_DETECTORS: ReadonlyArray<{
	corePackage: string
	framework: string
}> = [
	{ corePackage: '@angular/core', framework: '@storybook/angular' },
	{ corePackage: 'next', framework: '@storybook/nextjs' },
	{ corePackage: '@sveltejs/kit', framework: '@storybook/sveltekit' },
	{ corePackage: 'svelte', framework: '@storybook/svelte-vite' },
	{ corePackage: 'react', framework: '@storybook/react-vite' },
]

function frameworkFromRaw(raw: string | null): Framework {
	if (!raw) return 'unknown'
	if (raw === '@storybook/react-vite') return 'react-vite'
	if (raw === '@storybook/sveltekit') return 'sveltekit'
	if (raw === '@storybook/svelte-vite') return 'svelte-vite'
	// `@storybook/angular` is webpack5-only today. Reserving the bare `'angular'`
	// framework value for the future Vite-based Angular Storybook framework if it
	// ships — current Angular goes in as `'angular-webpack'`.
	if (raw === '@storybook/angular') return 'angular-webpack'
	if (raw === '@storybook/nextjs') return 'nextjs-webpack'
	return 'unsupported'
}

/**
 * Scan a project's full dependency surface (deps + devDeps + peerDeps) for the
 * highest-priority core framework package and return the corresponding
 * `@storybook/<framework>` value. Returns `null` if no recognised core
 * framework package is present (caller falls back to the `.storybook/main`
 * regex).
 */
function findFrameworkInDeps(
	allDependencyKeys: ReadonlySet<string>,
): string | null {
	for (const { corePackage, framework } of CORE_FRAMEWORK_DETECTORS) {
		if (allDependencyKeys.has(corePackage)) return framework
	}
	return null
}

function bundlerFromFramework(framework: Framework): Detection['bundler'] {
	switch (framework) {
		case 'react-vite':
		case 'sveltekit':
		case 'svelte-vite':
			return 'vite'
		case 'angular-webpack':
		case 'nextjs-webpack':
			return 'webpack5'
		default:
			return 'unknown'
	}
}

export function isFrameworkSupported(framework: Framework): boolean {
	return (
		framework === 'react-vite' ||
		framework === 'sveltekit' ||
		framework === 'svelte-vite'
	)
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
	// package.json scan turned up zero matches OR multiple matches (the latter
	// happens in monorepos / in-progress migrations where multiple framework
	// packages legitimately coexist — the regex disambiguates by what the
	// main config file actually imports).
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
