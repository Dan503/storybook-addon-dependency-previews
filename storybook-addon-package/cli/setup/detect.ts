import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { stripCommentsRespectingStrings } from './util.js'

export type Framework =
	| 'react-vite'
	| 'sveltekit'
	| 'svelte-vite'
	| 'angular'
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

export type Detection = {
	storybookDir: string
	mainFile: MainFile | null
	previewFile: PreviewFile | null
	framework: Framework
	frameworkRaw: string | null
	bundler: 'vite' | 'webpack5' | 'unknown'
	packageManager: PackageManager
	isEsm: boolean
	hasAddonInstalled: boolean
	hasDependencyCruiserInstalled: boolean
}

const MAIN_CANDIDATES: ReadonlyArray<MainFile['lang']> = ['ts', 'mjs', 'js', 'cjs']
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

function frameworkFromRaw(raw: string | null): Framework {
	if (!raw) return 'unknown'
	if (raw === '@storybook/react-vite') return 'react-vite'
	if (raw === '@storybook/sveltekit') return 'sveltekit'
	if (raw === '@storybook/svelte-vite') return 'svelte-vite'
	if (raw === '@storybook/angular') return 'angular'
	if (raw === '@storybook/nextjs') return 'nextjs-webpack'
	return 'unsupported'
}

function bundlerFromFramework(framework: Framework): Detection['bundler'] {
	switch (framework) {
		case 'react-vite':
		case 'sveltekit':
		case 'svelte-vite':
			return 'vite'
		case 'angular':
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

	let frameworkRaw: string | null = null
	if (mainFile) {
		try {
			const content = readFileSync(mainFile.path, 'utf8')
			// Strip comments first so a commented-out `framework: ...` example
			// (or a code snippet inside a block comment) can't be detected as the
			// active framework.
			const codeOnly = stripCommentsRespectingStrings(content)
			const match = codeOnly.match(FRAMEWORK_REGEX)
			frameworkRaw = match?.[1] || match?.[2] || null
		} catch {
			frameworkRaw = null
		}
	}

	const framework = frameworkFromRaw(frameworkRaw)
	const bundler = bundlerFromFramework(framework)

	let isEsm = false
	let hasAddonInstalled = false
	let hasDependencyCruiserInstalled = false
	try {
		const pkg = JSON.parse(readFileSync(resolve(cwd, 'package.json'), 'utf8'))
		isEsm = pkg.type === 'module'
		const merged = {
			...(pkg.dependencies ?? {}),
			...(pkg.devDependencies ?? {}),
		}
		hasAddonInstalled = 'storybook-addon-dependency-previews' in merged
		hasDependencyCruiserInstalled = 'dependency-cruiser' in merged
	} catch {
		// no package.json or unreadable — leave defaults
	}

	return {
		storybookDir,
		mainFile,
		previewFile,
		framework,
		frameworkRaw,
		bundler,
		packageManager: detectPackageManager(cwd),
		isEsm,
		hasAddonInstalled,
		hasDependencyCruiserInstalled,
	}
}
