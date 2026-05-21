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

export type FrameworkDetectionSource = 'package.json' | 'main.ts' | 'none'

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
 * Storybook framework packages we know how to handle. A consumer project always
 * declares one of these in its dependency tree (deps / devDeps / peerDeps) —
 * Storybook can't run without one. This list is the single source of truth for
 * both the package.json scan and the regex match against `main.ts`.
 */
const KNOWN_FRAMEWORK_PACKAGES: ReadonlyArray<string> = [
	'@storybook/react-vite',
	'@storybook/sveltekit',
	'@storybook/svelte-vite',
	'@storybook/angular',
	'@storybook/nextjs',
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
 * Scan a project's full dependency surface (deps + devDeps + peerDeps) for
 * exactly one known Storybook framework package. Returns the matched package
 * name when there's an unambiguous winner, otherwise `null` (zero matches OR
 * multiple matches — caller falls back to the `main.ts` regex to disambiguate).
 */
function findFrameworkInDeps(
	allDependencyKeys: ReadonlySet<string>,
): string | null {
	const matches = KNOWN_FRAMEWORK_PACKAGES.filter((pkg) =>
		allDependencyKeys.has(pkg),
	)
	return matches.length === 1 ? matches[0]! : null
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
		// for framework detection, because Angular consumers commonly declare
		// `@storybook/angular` as a peer dep rather than a direct dev dep.
		allDependencyKeys = new Set([
			...Object.keys(installed),
			...Object.keys(pkg.peerDependencies ?? {}),
		])
	} catch {
		// no package.json or unreadable — leave defaults (empty sets)
	}

	// Primary signal: scan the project's dependency surface for exactly one
	// recognised Storybook framework package. This works even when
	// `.storybook/main.ts` is missing (minimal setups) or formatted in a way
	// the regex below can't parse.
	let frameworkRaw: string | null = findFrameworkInDeps(allDependencyKeys)
	let frameworkDetectionSource: FrameworkDetectionSource =
		frameworkRaw ? 'package.json' : 'none'

	// Fallback: regex-match `main.ts`. Runs when the package.json scan turned
	// up zero matches OR multiple matches (the latter happens in monorepos /
	// in-progress migrations where multiple framework packages legitimately
	// coexist — the regex disambiguates by what `main.ts` actually imports).
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
				frameworkDetectionSource = 'main.ts'
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
