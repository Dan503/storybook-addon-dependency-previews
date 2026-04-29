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

export interface InstallMissingPackagesOptions {
	/** Current working directory the package manager command runs in. */
	cwd: string
	/** Package manager detected from the project's lockfile. */
	packageManager: PackageManager
	/** True if `storybook-addon-dependency-previews` is already in the project's deps. */
	hasAddonInstalled: boolean
	/** True if `dependency-cruiser` is already in the project's deps. */
	hasDependencyCruiserInstalled: boolean
}

/**
 * Run the detected package manager to install whichever of the addon's
 * required packages aren't already in the project. Returns a structured
 * result describing what happened (skipped / installed / failed) so the
 * caller can surface a clean message instead of catching a thrown error.
 */
export function installMissingPackages(
	opts: InstallMissingPackagesOptions,
): InstallResult {
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
