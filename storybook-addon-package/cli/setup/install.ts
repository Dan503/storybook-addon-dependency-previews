import { spawnSync } from 'node:child_process'

import type { PackageManager } from './detect.js'

export type InstallResult =
	| { kind: 'skipped'; reason: string }
	| { kind: 'installed'; packages: ReadonlyArray<string> }
	| { kind: 'failed'; reason: string }

const REQUIRED_PACKAGES = [
	'storybook-addon-dependency-previews',
	'dependency-cruiser',
] as const

function buildArgs(
	pm: PackageManager,
	packages: ReadonlyArray<string>,
): Array<string> {
	switch (pm) {
		case 'pnpm':
			return ['add', '-D', ...packages]
		case 'yarn':
			return ['add', '-D', ...packages]
		case 'bun':
			return ['add', '-d', ...packages]
		case 'npm':
		default:
			return ['install', '-D', ...packages]
	}
}

export function installMissingPackages(opts: {
	cwd: string
	packageManager: PackageManager
	hasAddonInstalled: boolean
	hasDependencyCruiserInstalled: boolean
}): InstallResult {
	const missing = REQUIRED_PACKAGES.filter((p) => {
		if (p === 'storybook-addon-dependency-previews')
			return !opts.hasAddonInstalled
		if (p === 'dependency-cruiser') return !opts.hasDependencyCruiserInstalled
		return false
	})

	if (missing.length === 0) {
		return { kind: 'skipped', reason: 'all required packages already installed' }
	}

	const args = buildArgs(opts.packageManager, missing)
	const result = spawnSync(opts.packageManager, args, {
		cwd: opts.cwd,
		stdio: 'inherit',
		shell: process.platform === 'win32',
	})

	if (result.error) {
		return {
			kind: 'failed',
			reason: `Failed to spawn ${opts.packageManager}: ${result.error.message}`,
		}
	}
	if (result.status !== 0) {
		return {
			kind: 'failed',
			reason: `${opts.packageManager} ${args.join(' ')} exited with code ${result.status}`,
		}
	}
	return { kind: 'installed', packages: missing }
}
