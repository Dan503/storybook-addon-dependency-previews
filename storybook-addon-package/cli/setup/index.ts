/* eslint-disable no-console */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'

import {
	detectProject,
	isFrameworkSupported,
	type Framework,
} from './detect.js'
import { detectProjectRepoUrl } from './gitOrigin.js'
import { installMissingPackages } from './install.js'
import { patchMainFile } from './patchers/main.js'
import { patchPackageJson } from './patchers/packageJson.js'
import { patchPreviewFile } from './patchers/preview.js'
import { writeSbDepsConfigIfNeeded } from './patchers/sbDepsConfig.js'
import { choose, confirm, input } from './prompt.js'
import { resolveSrcDir } from './srcDir.js'

function log(line: string) {
	console.log(line)
}

function rule() {
	console.log('────────────────────────────────────────────')
}

export async function runSetup(argv: ReadonlyArray<string>): Promise<void> {
	void argv
	const cwd = process.cwd()

	rule()
	log('sb-deps setup — automated configuration wizard')
	rule()

	let detection = detectProject(cwd)

	if (!existsSync(detection.storybookDir)) {
		log('No `.storybook/` directory found in the current working directory.')
		const runInit = await confirm(
			'Run `npx storybook@latest init` now to scaffold Storybook?',
			true,
		)
		if (!runInit) {
			log(
				'Cancelled. Run `npx storybook@latest init` yourself, then re-run `npx sb-deps setup`.',
			)
			process.exit(1)
		}

		rule()
		log('Running `npx storybook@latest init`…')
		const initResult = spawnSync('npx', ['storybook@latest', 'init'], {
			cwd,
			stdio: 'inherit',
			shell: process.platform === 'win32',
		})
		if (initResult.error) {
			log(`  ✗ Could not spawn storybook init: ${initResult.error.message}`)
			process.exit(1)
		}
		if (initResult.status !== 0) {
			log(
				`  ✗ \`npx storybook@latest init\` exited with code ${initResult.status}.`,
			)
			process.exit(1)
		}

		// Re-detect — storybook init created `.storybook/`, modified `package.json`,
		// and (depending on user choice) installed framework-specific deps.
		detection = detectProject(cwd)
		if (!existsSync(detection.storybookDir)) {
			log(
				'  ✗ `npx storybook@latest init` finished but `.storybook/` is still missing — aborting.',
			)
			process.exit(1)
		}
		rule()
	}

	if (!detection.mainFile) {
		log(
			`No main.{ts,js,mjs,cjs} found inside ${detection.storybookDir}. Cannot continue.`,
		)
		process.exit(1)
	}

	const detectionSourceLabel =
		detection.frameworkDetectionSource === 'none'
			? ''
			: ` (from ${detection.frameworkDetectionSource})`
	log(
		`Detected framework : ${detection.frameworkRaw ?? '(unknown)'}${detectionSourceLabel}`,
	)
	log(`Detected pkg manager: ${detection.packageManager}`)

	let framework: Framework = detection.framework

	// Detect the source root URL (from git origin) and resolve the source
	// folder up front, so both can be reported in this detection block — the
	// user sees the full picture before they confirm. Both auto-detect
	// without bothering the user except for the Next.js-without-`src/` edge
	// case where `resolveSrcDir` may prompt for a folder name. That prompt
	// fires after the framework has already been printed above so the
	// context is established.
	const detectedRepoUrl = detectProjectRepoUrl(cwd)
	if (detectedRepoUrl?.url) {
		log(`Source root URL    : ${detectedRepoUrl.url}`)
		if (detectedRepoUrl.branchSource === 'fallback-main') {
			log(
				`                     (couldn't read default branch from remote — used 'main')`,
			)
		}
	} else if (detectedRepoUrl?.warning) {
		log(`Source root URL    : (auto-detect skipped — see step 3)`)
	} else {
		log(`Source root URL    : (no git origin detected — will prompt in step 3)`)
	}

	const resolvedSrcDir = await resolveSrcDir(cwd, framework)
	const displaySrcDir =
		resolvedSrcDir.srcDir === '' ? '(project root)' : resolvedSrcDir.srcDir
	log(`Source folder      : ${displaySrcDir}`)

	log(`Storybook main file: ${detection.mainFile.path}`)
	log(
		`Preview file       : ${detection.previewFile?.path ?? '(does not exist — will be created)'}`,
	)
	rule()

	// Webpack-based Storybook frameworks aren't supported by the wizard — Vite is
	// required for the addon's `import.meta.glob` story-discovery. They share a
	// single manual-setup doc that walks through the webpack additions (custom
	// CSS-modules loader, `__PROJECT_ROOT__` define) with framework-specific
	// callouts where Angular and Next.js diverge.
	if (detection.bundler === 'webpack5') {
		log(
			'Webpack-based Storybook projects are not supported by the wizard — Vite is required.',
		)
		log(
			'Manual setup guide: https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/storybook-addon-package/docs/manual-setup-webpack.md',
		)
		// Next.js users may have just told us a non-default srcDir via the
		// prompt above. Persist it to sb-deps.config so the manual setup
		// steps don't need to re-derive it and so the runtime dep-cruiser
		// scan picks up the right folder on first run.
		if (framework === 'nextjs-webpack' && resolvedSrcDir.isCustom) {
			const cfg = writeSbDepsConfigIfNeeded({
				cwd,
				srcDir: resolvedSrcDir.srcDir,
				isEsm: detection.isEsm,
			})
			if (cfg.kind === 'created') {
				log(`✓ wrote ${cfg.path} (srcDir: '${resolvedSrcDir.srcDir}')`)
			} else if (cfg.kind === 'failed') {
				log(`⚠ ${cfg.reason}`)
			}
		}
		return
	}

	if (framework === 'unsupported') {
		log(
			`This addon currently supports React and Svelte only. Detected "${detection.frameworkRaw}".`,
		)
		log(
			'If you would like to see support added for your framework, please open an issue on GitHub.',
		)
		return
	}

	if (framework === 'unknown') {
		log('Could not detect a framework from the main config file.')
		const choice = await choose<
			'react-vite' | 'sveltekit' | 'svelte-vite' | 'cancel'
		>('Which framework is this project using?', [
			{ label: 'React (@storybook/react-vite)', value: 'react-vite' },
			{
				label: 'Svelte with SvelteKit (@storybook/sveltekit)',
				value: 'sveltekit',
			},
			{
				label: 'Svelte without SvelteKit (@storybook/svelte-vite)',
				value: 'svelte-vite',
			},
			{ label: 'Cancel', value: 'cancel' },
		])
		if (choice === 'cancel') {
			log('Setup cancelled.')
			return
		}
		framework = choice
	}

	if (!isFrameworkSupported(framework)) {
		log('Internal error: framework not supported after detection. Aborting.')
		process.exit(1)
	}

	const proceed = await confirm(
		'Proceed with installing dependencies and patching your Storybook config?',
		true,
	)
	if (!proceed) {
		log('Setup cancelled.')
		return
	}

	rule()
	log('Step 1/5: installing dependencies')
	const installResult = installMissingPackages({
		cwd,
		packageManager: detection.packageManager,
		installedPackages: detection.installedPackages,
	})
	if (installResult.kind === 'failed') {
		log(`  ✗ ${installResult.reason}`)
		log('  Aborting — fix the install error and re-run.')
		process.exit(1)
	}
	if (installResult.kind === 'skipped') {
		log(`  ✓ ${installResult.reason}`)
	} else {
		log(`  ✓ installed ${installResult.packages.join(', ')}`)
	}

	rule()
	log('Step 2/5: registering the addon in main.ts')
	const mainResult = patchMainFile(detection.mainFile)
	switch (mainResult.kind) {
		case 'patched':
			if (mainResult.addedAddon) {
				log(
					`  ✓ added 'storybook-addon-dependency-previews/addon' (${mainResult.appliedTo})`,
				)
			} else {
				log('  ✓ updated main.ts (no addon insertion needed)')
			}
			if (mainResult.removedAddons && mainResult.removedAddons.length > 0) {
				log(
					`  ✓ removed redundant entries (auto-registered by /addon preset): ${mainResult.removedAddons.join(', ')}`,
				)
			}
			if (mainResult.warnings) {
				for (const warning of mainResult.warnings) {
					log(`  ⚠ ${warning}`)
				}
			}
			break
		case 'skipped':
			log(`  ✓ ${mainResult.reason}`)
			if (mainResult.warnings) {
				for (const warning of mainResult.warnings) {
					log(`  ⚠ ${warning}`)
				}
			}
			break
		case 'failed':
			log(`  ✗ ${mainResult.reason}`)
			log(
				"  Add `'storybook-addon-dependency-previews/addon'` to your `addons:` array manually, then re-run.",
			)
			process.exit(1)
	}

	rule()
	log('Step 3/5: configuring preview file')
	// The runtime concatenates `sourceRootUrl + '/' + componentPath` (where
	// `componentPath` is the project-relative dep-graph key, e.g.
	// `src/components/Foo.tsx`), so the URL must point at the *project root*
	// inside the git repo — NOT a `src/` subfolder. The URL was already
	// auto-detected and reported in the detection block above; here we
	// either use that detected value or fall back to a manual prompt when
	// detection couldn't produce a working URL.
	let sourceRootUrl: string
	if (detectedRepoUrl && detectedRepoUrl.url) {
		sourceRootUrl = detectedRepoUrl.url
		log(`  ✓ using detected source root URL`)
	} else {
		if (detectedRepoUrl?.warning) log(`  ⚠ ${detectedRepoUrl.warning}`)
		const sourceRootInputMessage = [
			'\n= Source root URL =',
			'Provide the URL to the root of your project inside your git repo.',
			'This is the folder that contains your package.json — NOT the src folder.',
			'Component file paths are appended to this URL to build "view source" links.',
			'Example: https://github.com/your-org/your-repo/blob/main',
			'(For a monorepo, include the project subpath: .../blob/main/packages/my-app)',
			'\nEnter your source root URL (blank = disable source links):',
		].join('\n')
		sourceRootUrl = await input(sourceRootInputMessage, '')
	}
	const previewResult = patchPreviewFile({
		storybookDir: detection.storybookDir,
		previewFile: detection.previewFile,
		mainFile: detection.mainFile,
		framework,
		sourceRootUrl,
		srcDir: resolvedSrcDir.srcDir,
	})
	switch (previewResult.kind) {
		case 'created':
			log(`  ✓ created ${previewResult.path}`)
			break
		case 'patched':
			log(`  ✓ patched ${previewResult.path}`)
			break
		case 'skipped':
			log(`  ✓ ${previewResult.reason}`)
			break
		case 'failed':
			log(`  ✗ ${previewResult.reason}`)
			log(
				'  Manual setup: https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/storybook-addon-package/docs/manual-setup-vite.md',
			)
			process.exit(1)
	}

	rule()
	log('Step 4/5: adding npm scripts to package.json')
	const pkgResult = await patchPackageJson(cwd)
	if (pkgResult.kind === 'failed') {
		log(`  ✗ ${pkgResult.reason}`)
		process.exit(1)
	}
	for (const outcome of pkgResult.outcomes) {
		switch (outcome.action) {
			case 'added':
				log(`  ✓ added "${outcome.name}"`)
				break
			case 'kept':
				log(`  • kept existing "${outcome.name}"`)
				break
			case 'overwritten':
				log(`  ✓ overwrote "${outcome.name}" (was: ${outcome.previous})`)
				break
			case 'unchanged':
				log(`  ✓ "${outcome.name}" already correct`)
				break
		}
	}

	// Write `sb-deps.config.{js,cjs}` when the resolved srcDir isn't the default
	// `'src'`. Must happen before Step 5 so the sb-deps build below picks up
	// the configured srcDir on its first run. Silent no-op for the default
	// case so non-Next.js setups don't see an extra log line.
	const sbDepsConfigResult = writeSbDepsConfigIfNeeded({
		cwd,
		srcDir: resolvedSrcDir.srcDir,
		isEsm: detection.isEsm,
	})
	if (sbDepsConfigResult.kind === 'created') {
		rule()
		log(`  ✓ wrote ${sbDepsConfigResult.path} (srcDir: '${resolvedSrcDir.srcDir}')`)
	} else if (sbDepsConfigResult.kind === 'failed') {
		rule()
		log(`  ⚠ ${sbDepsConfigResult.reason}`)
		log(`    Continuing — you can set srcDir manually in sb-deps.config.{js,cjs}.`)
	}

	rule()
	log('Step 5/5: generating .storybook/dependency-previews.json')
	// Re-invoke the same sb-deps binary that's running this wizard so we don't
	// risk npx resolving a different version of the package.
	const buildResult = spawnSync(process.execPath, [process.argv[1]!], {
		cwd,
		stdio: 'inherit',
	})
	let buildSucceeded = false
	if (buildResult.error) {
		log(`  ✗ could not spawn sb-deps: ${buildResult.error.message}`)
		log(
			`  You can run the dependency build manually with: ${detection.packageManager} run sb:deps`,
		)
	} else if (buildResult.status !== 0) {
		log(`  ✗ initial dependency build failed (exit ${buildResult.status}).`)
		log(
			`  You can run it manually with: ${detection.packageManager} run sb:deps`,
		)
	} else {
		log('  ✓ dependency-previews.json generated')
		buildSucceeded = true
	}

	rule()
	const runCmd =
		detection.packageManager === 'npm'
			? 'npm run sb'
			: detection.packageManager === 'bun'
				? 'bun run sb'
				: `${detection.packageManager} sb`
	if (buildSucceeded) {
		log('Setup complete.')
		log(`Next: run \`${runCmd}\` to start Storybook with dependency watching.`)
		rule()
	} else {
		log('Setup completed with warnings.')
		log(
			`Run \`${detection.packageManager} run sb:deps\` once the issue above is resolved, then \`${runCmd}\` to start Storybook.`,
		)
		rule()
		process.exit(1)
	}
}
