import { spawnSync } from 'node:child_process'

import type { PackageManager } from './detect.js'
import { escapeForCmdExe } from './util.js'

const IS_WIN = process.platform === 'win32'

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
 * The two `@storybook/*` addons are installed at the project's own Storybook
 * version (see `storybookAddonVersionSpec` below); the other two have no
 * version specifier, so the package manager picks `@latest`.
 */
const REQUIRED_PACKAGES = [
	'storybook-addon-dependency-previews',
	'dependency-cruiser',
	'@storybook/addon-docs',
	'@storybook/addon-links',
] as const

type RequiredPackage = (typeof REQUIRED_PACKAGES)[number]

/**
 * Packages that ship in lockstep with the `storybook` core and declare a peer
 * range on it. Installing them at `@latest` only works while `@latest` is the
 * same major as the project's core — with Storybook 10 and 11 both supported,
 * a 10 project would get the 11 addons (or an 11 project the 10 ones) and npm
 * would refuse the install, so these are pinned to the project's own version.
 */
const STORYBOOK_CORE_ALIGNED_PACKAGES: ReadonlyArray<RequiredPackage> = [
	'@storybook/addon-docs',
	'@storybook/addon-links',
]

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
	/**
	 * Version to install the `@storybook/*` addons at so they match the
	 * project's Storybook core (`Detection.storybookAddonVersionSpec`). When
	 * `null` they are installed without a version, i.e. at `@latest`.
	 */
	storybookAddonVersionSpec: string | null
}

/** `@storybook/addon-docs` + `10.2.17` → `@storybook/addon-docs@10.2.17`. */
function getInstallSpec(
	pkg: RequiredPackage,
	storybookAddonVersionSpec: string | null,
): string {
	const isCoreAligned = STORYBOOK_CORE_ALIGNED_PACKAGES.includes(pkg)
	if (!isCoreAligned || !storybookAddonVersionSpec) return pkg
	return `${pkg}@${storybookAddonVersionSpec}`
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
		return {
			kind: 'skipped',
			reason: 'all required packages already installed',
		}
	}

	const installSpecs = missing.map((pkg) =>
		getInstallSpec(pkg, opts.storybookAddonVersionSpec),
	)
	const args = buildArgs(opts.packageManager, installSpecs)
	// On Windows the package manager is usually a `.cmd` shim, which needs
	// `shell: true` — and cmd.exe then strips the `^` from a range like
	// `^11.0.0-0`, so the args go through escapeForCmdExe (which quotes them).
	// On other platforms they pass through untouched.
	const result = spawnSync(
		opts.packageManager,
		IS_WIN ? args.map(escapeForCmdExe) : args,
		{
			cwd: opts.cwd,
			stdio: 'inherit',
			shell: IS_WIN,
		},
	)

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
