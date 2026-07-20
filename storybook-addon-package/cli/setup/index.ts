/* eslint-disable no-console */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { relative as pathRelative } from 'node:path'

import {
	detectProject,
	isFrameworkSupported,
	type Framework,
} from './detect.js'
import { detectProjectRepoUrl } from './gitOrigin.js'
import { installMissingPackages } from './install.js'
import {
	patchMainFile,
	patchStoriesGlobForStoryExtension,
} from './patchers/main.js'
import { patchPackageJson } from './patchers/packageJson.js'
import { patchPreviewFile } from './patchers/preview.js'
import { writeSbDepsConfigIfNeeded } from './patchers/sbDepsConfig.js'
import { ask, choose, confirm, confirmOrEdit, input } from './prompt.js'
import { resolveSrcDir } from './srcDir.js'

import type { SbDepsConfig } from '../../src/config.js'

function log(line: string) {
	console.log(line)
}

function rule() {
	console.log('────────────────────────────────────────────')
}

// The story-file extension the scaffolder generates for each framework — used
// only to render a concrete example next to the story-extension preference
// (Vue stories are `.stories.ts`, Svelte `.stories.svelte`, React `.stories.tsx`).
function exampleStoryFileExtension(framework: Framework): string {
	switch (framework) {
		case 'sveltekit':
		case 'svelte-vite':
			return 'svelte'
		case 'react-vite':
		case 'nextjs-webpack':
			return 'tsx'
		// Angular, Vue, and unknown fall through to `ts` — the Angular scaffolder
		// strips `.component` and emits `<Name>.stories.ts`, and Vue emits
		// `<Name>.stories.ts`, so `ComponentName.stories.ts` is the accurate example.
		default:
			return 'ts'
	}
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
		`Detected framework  : ${detection.frameworkRaw ?? '(unknown)'}${detectionSourceLabel}`,
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
		log(`Git project root URL: ${detectedRepoUrl.url}`)
		if (detectedRepoUrl.branchSource === 'fallback-main') {
			log(
				`                      (couldn't read default branch from remote — used 'main')`,
			)
		}
	} else if (detectedRepoUrl?.warning) {
		log(`Git project root URL: (auto-detect skipped — see step 3)`)
	} else {
		log(
			`Git project root URL: (no git origin detected — will prompt in step 3)`,
		)
	}

	const resolvedSrcDir = await resolveSrcDir(cwd, framework)
	const displaySrcDir =
		resolvedSrcDir.srcDir === '' ? '(project root)' : resolvedSrcDir.srcDir
	log(`Source folder       : ${displaySrcDir}`)
	// Assumed default; the user can change it in the edit flow below. The
	// example filename uses the story extension the scaffolder emits for the
	// detected framework.
	log(
		`Storybook Extension : stories (eg. ComponentName.stories.${exampleStoryFileExtension(framework)})`,
	)

	// Show file paths relative to cwd so the detection block stays compact —
	// absolute Windows paths in particular are noisy and push the actually-
	// useful bits of the line off-screen. Normalise `\` to `/` so the local
	// paths read consistently with the forward-slash URL/glob fields shown
	// elsewhere in the block.
	const displayRelPath = (absPath: string) =>
		pathRelative(cwd, absPath).replace(/\\/g, '/')
	log(`Storybook main file : ${displayRelPath(detection.mainFile.path)}`)
	log(
		`Preview file        : ${
			detection.previewFile
				? displayRelPath(detection.previewFile.path)
				: '(does not exist — will be created)'
		}`,
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
				log(`✓ wrote ${cfg.path} (${cfg.fields.join(', ')})`)
			} else if (cfg.kind === 'failed') {
				log(`⚠ ${cfg.reason}`)
			}
		}
		return
	}

	if (framework === 'unsupported') {
		log(
			`This setup wizard currently supports React, Svelte, Vue 3, and Solid (all Vite-based) only. Detected "${detection.frameworkRaw}".`,
		)
		log(
			'The addon itself also supports Angular and Next.js with a one-time manual setup — see https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/storybook-addon-package/docs/manual-setup-webpack.md.',
		)
		log(
			'If you would like to see wizard support added for your framework, please open an issue on GitHub.',
		)
		return
	}

	if (framework === 'unknown') {
		log('Could not detect a framework from the main config file.')
		const choice = await choose<
			| 'react-vite'
			| 'sveltekit'
			| 'svelte-vite'
			| 'vue3-vite'
			| 'solid-vite'
			| 'cancel'
		>('Which framework is this project using?', [
			{ label: 'React (@storybook/react-vite)', value: 'react-vite' },
			{ label: 'Vue 3 (@storybook/vue3-vite)', value: 'vue3-vite' },
			{
				label: 'Svelte with SvelteKit (@storybook/sveltekit)',
				value: 'sveltekit',
			},
			{
				label: 'Svelte without SvelteKit (@storybook/svelte-vite)',
				value: 'svelte-vite',
			},
			{ label: 'Solid (storybook-solidjs-vite)', value: 'solid-vite' },
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

	// Values the rest of the wizard will use. Start with whatever auto-detect
	// produced; the edit branch below can replace them with user-supplied
	// values. `userOverrodeUrl` lets step 3 skip its fallback prompt when the
	// user has consciously made a choice — including an explicit empty URL
	// from the edit flow.
	let effectiveSourceRootUrl = detectedRepoUrl?.url ?? ''
	let effectiveSrcDir = resolvedSrcDir.srcDir
	let userOverrodeUrl = false
	let effectiveStorybookFileExtension: NonNullable<
		SbDepsConfig['storybookFileExtension']
	> = 'stories'

	const choice = await confirmOrEdit(
		'Proceed with installing dependencies and patching your Storybook config?',
	)
	if (choice === 'no') {
		log('Setup cancelled.')
		return
	}
	if (choice === 'edit') {
		rule()
		log('= Edit detected values =')
		log('Press Enter to keep the current value, or type a new one.')

		// Git project root URL — the URL the addon links component file paths
		// to. Blank disables source links.
		effectiveSourceRootUrl = (
			await input('\nGit project root URL', effectiveSourceRootUrl)
		).trim()
		userOverrodeUrl = true

		// Source folder — must be a single folder name. Reject slashes
		// explicitly so the user gets a clear "nested folders aren't
		// supported" message rather than a generic character-class error.
		while (true) {
			const displayCurrent = effectiveSrcDir === '' ? '.' : effectiveSrcDir
			const raw = (
				await input(
					'\nSource folder (single folder name, or "." for project root)',
					displayCurrent,
				)
			).trim()
			if (raw === '.' || raw === './') {
				effectiveSrcDir = ''
				break
			}
			if (raw.includes('/') || raw.includes('\\')) {
				log(
					`  "${raw}" contains a path separator — nested source folders aren't supported. Use a single folder name, or "." for the project root.`,
				)
				continue
			}
			if (raw === '..') {
				log(`  ".." is not a valid source folder name.`)
				continue
			}
			if (!/^[A-Za-z0-9._-]+$/.test(raw)) {
				log(
					`  "${raw}" is not a valid folder name — must be alphanumerics, ".", "_", or "-" (or "." for the project root).`,
				)
				continue
			}
			effectiveSrcDir = raw
			break
		}

		// Storybook file extension — the naming used for generated story files.
		// Numbered choice; Enter keeps the current value (default `stories`). The
		// examples use the story extension the scaffolder emits for this framework.
		const exampleExt = exampleStoryFileExtension(framework)
		while (true) {
			log('\nStorybook file extension for generated stories:')
			log(`  1) story   → Foo.story.${exampleExt}`)
			log(`  2) stories → Foo.stories.${exampleExt} (default)`)
			const raw = (
				await ask(
					`  Enter 1 or 2, or press Enter to keep "${effectiveStorybookFileExtension}": `,
				)
			).trim()
			if (raw === '') break
			if (raw === '1') {
				effectiveStorybookFileExtension = 'story'
				break
			}
			if (raw === '2') {
				effectiveStorybookFileExtension = 'stories'
				break
			}
			log(`  "${raw}" not recognised — enter 1, 2, or press Enter.`)
		}
		rule()
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

	// When the project uses the singular `.story.` naming, widen Storybook's own
	// `stories` glob so it discovers `.story.*` files — otherwise the scaffolded
	// stories are created correctly but never show up in the Storybook sidebar.
	if (effectiveStorybookFileExtension === 'story') {
		const storiesGlobResult = patchStoriesGlobForStoryExtension(
			detection.mainFile,
		)
		if (storiesGlobResult.kind === 'patched') {
			log('  ✓ widened the Storybook `stories` glob to also match `.story.*`')
		} else if (storiesGlobResult.kind === 'failed') {
			log(`  ⚠ ${storiesGlobResult.reason}`)
			log(
				'    Add `.story.` to the `stories` glob in main.ts manually so Storybook lists .story.* files.',
			)
		}
	}

	rule()
	log('Step 3/5: configuring preview file')
	// The runtime concatenates `sourceRootUrl + '/' + componentPath` (where
	// `componentPath` is the project-relative dep-graph key, e.g.
	// `src/components/Foo.tsx`), so the URL must point at the *project root*
	// inside the git repo — NOT a `src/` subfolder. By the time we get here
	// the URL has been either (a) auto-detected, (b) set via the edit flow,
	// or (c) left empty. Only case (c) needs the manual fallback prompt,
	// and only when the user hasn't already been asked via edit mode.
	let sourceRootUrl = effectiveSourceRootUrl
	if (sourceRootUrl) {
		log(`  ✓ using git project root URL: ${sourceRootUrl}`)
	} else if (userOverrodeUrl) {
		log(`  ✓ source links disabled (no URL set)`)
	} else {
		if (detectedRepoUrl?.warning) log(`  ⚠ ${detectedRepoUrl.warning}`)
		const sourceRootInputMessage = [
			'\n= Git project root URL =',
			'Provide the URL to the root of your project inside your git repo.',
			'This is the folder that contains your package.json — NOT the src folder.',
			'Component file paths are appended to this URL to build "view source" links.',
			'Example: https://github.com/your-org/your-repo/blob/main',
			'(For a monorepo, include the project subpath: .../blob/main/packages/my-app)',
			'\nEnter your git project root URL (blank = disable source links):',
		].join('\n')
		sourceRootUrl = await input(sourceRootInputMessage, '')
	}
	const previewResult = patchPreviewFile({
		storybookDir: detection.storybookDir,
		previewFile: detection.previewFile,
		mainFile: detection.mainFile,
		framework,
		sourceRootUrl,
		srcDir: effectiveSrcDir,
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

	// Write `sb-deps.config.{js,cjs}` when the effective srcDir isn't the
	// default `'src'`, when the project is Solid (the config carries
	// `tsxFramework: 'solid'` so the scaffolder knows to emit Solid — not React
	// — templates for `.tsx` files), or when the user chose a non-default
	// story-file extension. Must happen before Step 5 so the sb-deps build below
	// picks up the configured values on its first run. Silent no-op when
	// everything is default so setups without overrides don't see an extra log
	// line. Uses `effectiveSrcDir` so a user-edited value via the edit flow is
	// what gets persisted, not the auto-detected one.
	const isSolidProject = framework === 'solid-vite'
	const sbDepsConfigResult = writeSbDepsConfigIfNeeded({
		cwd,
		srcDir: effectiveSrcDir,
		isEsm: detection.isEsm,
		isSolid: isSolidProject,
		storybookFileExtension: effectiveStorybookFileExtension,
	})
	if (sbDepsConfigResult.kind === 'created') {
		rule()
		log(
			`  ✓ wrote ${sbDepsConfigResult.path} (${sbDepsConfigResult.fields.join(', ')})`,
		)
	} else if (sbDepsConfigResult.kind === 'failed') {
		rule()
		log(`  ⚠ ${sbDepsConfigResult.reason}`)
		log(
			`    Continuing — you can set srcDir manually in sb-deps.config.{js,cjs}.`,
		)
	} else if (sbDepsConfigResult.kind === 'skipped' && isSolidProject) {
		// A pre-existing config blocked the write, so the wizard could NOT
		// auto-persist `tsxFramework: 'solid'`. The existing config may or may not
		// already carry it (the wizard doesn't parse it), so point the user at
		// verifying it rather than assuming it's absent. Without the key the
		// scaffolder defaults to React templates for this Solid project's `.tsx`
		// files, silently, with no other signal.
		rule()
		log(`  ⚠ ${sbDepsConfigResult.reason}`)
		log(
			`    Ensure your existing sb-deps.config sets \`tsxFramework: 'solid'\` — without`,
		)
		log(
			`    that key the sb-deps scaffolder emits React (not Solid) templates for .tsx files.`,
		)
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
