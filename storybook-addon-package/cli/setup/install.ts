import { spawnSync } from 'node:child_process'

import type { PackageManager } from './detect.js'

export type InstallResult =
	| { kind: 'skipped'; reason: string }
	| { kind: 'installed'; packages: ReadonlyArray<string> }
	| { kind: 'failed'; reason: string }

/**
 * Packages the addon needs in the consumer project to function correctly.
 *
 * - `storybook-addon-dependency-previews` — the addon itself.
 * - `dependency-cruiser` — peer-dep used by the `sb-deps` CLI to walk the
 *   project's import graph.
 * - `@storybook/addon-docs` — peer-dep used by the addon's autodocs panel
 *   (`useOf`, `Source`, `Title` etc. from `@storybook/addon-docs/blocks`). Without
 *   it installed, the addon's docs panel silently fails to load and the user
 *   sees plain stories with no autodocs.
 * - `@storybook/addon-links` — peer-dep used by `linkTo` in the addon's
 *   `StoryLink` component (the "navigate to another story" links inside the
 *   dependency tree).
 *
 * No version specifiers — the package manager picks `@latest` for each, which
 * naturally aligns with whatever Storybook major version the user has.
 */
const REQUIRED_PACKAGES = [
	'storybook-addon-dependency-previews',
	'dependency-cruiser',
	'@storybook/addon-docs',
	'@storybook/addon-links',
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
	/**
	 * Names of every package already declared in the project's `dependencies`
	 * or `devDependencies`. Used to skip installing required packages that
	 * are already there. Members are bare package names (e.g.
	 * `'@storybook/addon-docs'`), without version specifiers.
	 */
	installedPackages: ReadonlySet<string>
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
	const missing = REQUIRED_PACKAGES.filter(
		(p) => !opts.installedPackages.has(p),
	)

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
