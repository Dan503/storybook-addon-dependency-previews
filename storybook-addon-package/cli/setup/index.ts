/* eslint-disable no-console */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { relative as pathRelative } from 'node:path'

import {
	detectProject,
	isFrameworkSupported,
	SUPPORTED_FRAMEWORKS,
	tsxFrameworkFromFramework,
	type Framework,
	type SupportedFramework,
	type TsxFramework,
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
import { getComponentMarkerError } from '../scripts/fileNames.js'
import { ask, choose, confirm, confirmOrEdit, input } from './prompt.js'
import { resolveSrcDir } from './srcDir.js'

import type { SbDepsConfig } from '../../src/config.js'

function log(line: string) {
	console.log(line)
}

function rule() {
	console.log('────────────────────────────────────────────')
}

/**
 * How each supported framework is offered in the wizard's framework picker,
 * naming the Storybook package so the user can match it against their own
 * config. A `Record`, so the compiler requires a label for every framework in
 * `SUPPORTED_FRAMEWORKS` — that is what stops a newly supported framework
 * being absent from the picker and unselectable.
 */
const FRAMEWORK_PICKER_LABELS: Record<SupportedFramework, string> = {
	'react-vite': 'React (@storybook/react-vite)',
	'preact-vite': 'Preact (@storybook/preact-vite)',
	'vue3-vite': 'Vue 3 (@storybook/vue3-vite)',
	sveltekit: 'Svelte with SvelteKit (@storybook/sveltekit)',
	'svelte-vite': 'Svelte without SvelteKit (@storybook/svelte-vite)',
	'solid-vite': 'Solid (storybook-solidjs-vite)',
	'web-components-vite':
		'Lit / web components (@storybook/web-components-vite)',
}

// The story-file extension the scaffolder generates for each framework — used
// only to render a concrete example next to the story-extension preference.
// The arms below carry the reasoning for each group; restating them here would
// be a second answer to the same question, free to drift from the first.
function exampleStoryFileExtension(framework: Framework): string {
	switch (framework) {
		case 'sveltekit':
		case 'svelte-vite':
			return 'svelte'
		// Every framework that writes `.tsx` components goes through
		// `storyPathForComponent`, which always spells the story `.tsx` — so the
		// example has to say `.tsx` for all of them, Solid and Preact included.
		case 'react-vite':
		case 'preact-vite':
		case 'solid-vite':
		case 'nextjs-webpack':
			return 'tsx'
		// Angular, Vue and Lit fall through to `ts` — the Angular scaffolder strips
		// `.component` and emits `<Name>.stories.ts`, Vue emits
		// `<Name>.stories.ts`, and Lit strips its own component marker and emits
		// the same, so `ComponentName.stories.ts` is the accurate example for all
		// three. `unsupported` and `unknown` land here too, and for those it is
		// a guess rather than an answer — which is why the caller asks whether the
		// extension is known before printing an example at all.
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
	// detected framework, so it is printed only where that extension is known.
	// It isn't for the two values that name no framework: `unknown` is picked
	// further down, and `unsupported` is one this tool has no templates for at
	// all. Either would print the fall-through `.ts`, and this block never
	// comes back to correct it.
	const isStoryExtensionKnown =
		framework !== 'unknown' && framework !== 'unsupported'
	const storyFileExample = isStoryExtensionKnown
		? ` (eg. ComponentName.stories.${exampleStoryFileExtension(framework)})`
		: ''
	log(`Storybook Extension : stories${storyFileExample}`)

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
			`This setup wizard currently supports React, Preact, Svelte, Vue 3, Solid, and Lit / web components (all Vite-based) only. Detected "${detection.frameworkRaw}".`,
		)
		log(
			'The addon itself also supports Angular and Next.js with a one-time manual setup — see https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/storybook-addon-package/docs/manual-setup-webpack.md.',
		)
		log(
			'If you would like to see wizard support added for your framework, please open an issue on GitHub.',
		)
		return
	}

	// Whether the framework was worked out from the project's own files, or
	// supplied by the user below. It decides whether the `tsxFramework` note
	// further down is worth printing: the scaffolder runs the same detection, so
	// it only needs telling which `.tsx` templates to use when that detection
	// came up empty.
	const wasFrameworkDetected = framework !== 'unknown'

	if (framework === 'unknown') {
		log('Could not detect a framework from the main config file.')
		// Built from the supported-framework list rather than written out again,
		// so a framework added there and not given a label here is a compile
		// error instead of an option the user silently cannot pick.
		const frameworkOptions: ReadonlyArray<{
			label: string
			value: SupportedFramework | 'cancel'
		}> = [
			...SUPPORTED_FRAMEWORKS.map((value) => ({
				label: FRAMEWORK_PICKER_LABELS[value],
				value,
			})),
			{ label: 'Cancel', value: 'cancel' },
		]
		const choice = await choose<SupportedFramework | 'cancel'>(
			'Which framework is this project using?',
			frameworkOptions,
		)
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

	// Asked after the confirmation above rather than among the detected values,
	// because it is a new decision rather than something detected — and asking it
	// here means a cancelled setup never asks it at all.
	const litComponentSuffix =
		framework === 'web-components-vite'
			? await askLitComponentMarker()
			: undefined

	// The answer above only takes effect in a project the scaffolder can see is
	// a Lit one, and nothing here can make it one — so say so while the answer
	// is still on screen. `wasFrameworkDetected` is the pre-picker fact, which
	// is exactly the question being asked: the scaffolder runs the same
	// detection, so where that came up empty for the wizard it comes up empty
	// for the scaffolder too.
	const isLitChosenFromThePicker =
		framework === 'web-components-vite' && !wasFrameworkDetected
	if (isLitChosenFromThePicker) logLitFrameworkNotDetectedNote()

	rule()
	log('Step 1/5: installing dependencies')
	const installResult = installMissingPackages({
		cwd,
		packageManager: detection.packageManager,
		installedPackages: detection.installedPackages,
		storybookAddonVersionSpec: detection.storybookAddonVersionSpec,
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
		storybookMajor: detection.storybookMajor,
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
	// default `'src'`, when the project's `.tsx` files aren't React's (the config
	// records `tsxFramework` outright, so the scaffolder emits Solid or Preact —
	// not React — templates for `.tsx` files even where its own detection of the
	// framework comes up empty), or when the user chose a non-default
	// story-file extension. Must happen before Step 5 so the sb-deps build below
	// picks up the configured values on its first run. Silent no-op when
	// everything is default so setups without overrides don't see an extra log
	// line. Uses `effectiveSrcDir` so a user-edited value via the edit flow is
	// what gets persisted, not the auto-detected one.
	const tsxFramework = tsxFrameworkFromFramework(framework)
	// Only worth saying where the scaffolder's own detection will come up empty
	// too. Where it can see which framework the project is, it emits that
	// framework's templates with or without the config key, so the note would be
	// telling the user to guard against something that cannot happen to them.
	const doesTsxFrameworkNeedTheKey =
		tsxFramework !== 'react' && !wasFrameworkDetected
	const sbDepsConfigResult = writeSbDepsConfigIfNeeded({
		cwd,
		srcDir: effectiveSrcDir,
		isEsm: detection.isEsm,
		tsxFramework,
		storybookFileExtension: effectiveStorybookFileExtension,
		litComponentSuffix,
	})
	// A marker the user asked FOR needs the key, and without it the scaffolder
	// does the opposite of what they chose. A CLEARED marker needs the key
	// absent, which it will be wherever the write simply had nothing to do — but
	// not where a config file was already there, since that file may set the key
	// and this never read it to find out. So the two answers need telling apart
	// from each other and the two skips need telling apart as well.
	const isLitProject = litComponentSuffix !== undefined
	const doesLitComponentSuffixNeedTheKey = !!litComponentSuffix
	const doesSkippedConfigNeedTsxFrameworkNote =
		sbDepsConfigResult.kind === 'skipped' && doesTsxFrameworkNeedTheKey
	// Either answer is at risk here: one needs a key that was not written, the
	// other needs one that may already be there.
	const doesSkippedConfigNeedLitSuffixNote =
		sbDepsConfigResult.kind === 'skipped' &&
		sbDepsConfigResult.cause === 'config-exists' &&
		isLitProject
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
		if (doesTsxFrameworkNeedTheKey) logTsxFrameworkNote(tsxFramework)
		if (doesLitComponentSuffixNeedTheKey)
			logLitComponentSuffixNote(litComponentSuffix)
	} else if (
		doesSkippedConfigNeedTsxFrameworkNote ||
		doesSkippedConfigNeedLitSuffixNote
	) {
		rule()
		log(`  ⚠ ${sbDepsConfigResult.reason}`)
		if (doesSkippedConfigNeedTsxFrameworkNote) logTsxFrameworkNote(tsxFramework)
		if (doesSkippedConfigNeedLitSuffixNote)
			logLitComponentSuffixNote(litComponentSuffix)
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

/** What the wizard suggests as a Lit project's component marker. */
const DEFAULT_LIT_COMPONENT_MARKER = 'lit'

/**
 * The word the user types to ask for no marker at all, since an empty answer
 * already means "keep the suggestion". The source-folder question above pays
 * the same small cost for its own `.`: a project that genuinely wanted to mark
 * its components with the word `none` cannot have it, which is why the prompt
 * says so rather than leaving it to be discovered.
 */
const NO_LIT_COMPONENT_MARKER_ANSWER = 'none'

/**
 * Ask a Lit project what marks a component file, and return the answer without
 * its dot — `'lit'` for `Button.lit.ts`, or the empty string for no marker at
 * all, where any plain `.ts` file created empty counts instead. Either answer
 * is about files under the source folder; nothing outside it is a component
 * whichever is given.
 *
 * Asked every time rather than only where it would change something, so
 * `.lit.ts` is the shape a set-up project ends up with, while anyone who would
 * rather a plain `.ts` file there were a component can say so.
 *
 * Built on `ask` rather than `input` because `input` returns its default for a
 * blank answer, so it has no way to tell "keep the suggestion" from "I want
 * nothing".
 */
async function askLitComponentMarker(): Promise<string> {
	const marker = await readLitComponentMarkerAnswer()
	// Said back either way, because the answer decides which files get
	// scaffolded and nothing else in the wizard's output would show it.
	log(
		marker
			? `  ✓ Files named *.${marker}.ts under your source folder will be treated as Lit components.`
			: '  ✓ Any plain .ts file you create empty under your source folder will be treated as a Lit component.',
	)
	return marker
}

/**
 * Warn that the marker answer will do nothing until the project says which
 * framework it is.
 *
 * Printed when the framework came from the picker rather than from the
 * project, which is the one case where the wizard knows the scaffolder will
 * disagree with it. Lit is the only framework this has to be said for: every
 * other one is recognised from the file being created — a `.tsx`, a `.vue`, a
 * `.svelte` — whereas a plain `.ts` file names no framework, so the whole Lit
 * check is only consulted in a project already known to be Lit.
 *
 * Nothing the wizard writes settles it, because the wizard never writes a
 * `framework` field, so the remedy has to be the user's. In practice a project
 * that runs Storybook at all already declares one; this is for the half-built
 * project where setup ran first.
 *
 * The `framework` field is the only remedy offered, though adding `lit` to the
 * dependencies would also do it in most projects. Detection reads the
 * dependencies first and the field only when they answer nothing — and one way
 * they answer nothing is two frameworks' core packages sitting side by side,
 * where `lit` is already present and adding it again changes nothing. The
 * field settles every case, so it is the one worth naming.
 */
function logLitFrameworkNotDetectedNote() {
	log(
		`\n  ! Your project does not say it is a Lit project, so sb-deps will not`,
	)
	log(`    scaffold Lit files and the answer above will have no effect.`)
	log(
		`    Set \`framework: '@storybook/web-components-vite'\` in .storybook/main.*`,
	)
	log(`    to fix that.`)
}

/** The component-marker question itself, re-asked until the answer can be used. */
async function readLitComponentMarkerAnswer(): Promise<string> {
	log('\nWhat marks a file as a Lit component?')
	log(
		`  A marker of "${DEFAULT_LIT_COMPONENT_MARKER}" means only Button.${DEFAULT_LIT_COMPONENT_MARKER}.ts under your source folder is a component.`,
	)
	log(
		`  Answer "${NO_LIT_COMPONENT_MARKER_ANSWER}" and any plain .ts file you create empty under your source folder is one.`,
	)
	while (true) {
		const answer = (
			await ask(
				`  Enter a marker, "${NO_LIT_COMPONENT_MARKER_ANSWER}", or press Enter to keep "${DEFAULT_LIT_COMPONENT_MARKER}": `,
			)
		).trim()
		if (answer === '') return DEFAULT_LIT_COMPONENT_MARKER
		if (answer.toLowerCase() === NO_LIT_COMPONENT_MARKER_ANSWER) return ''
		const markerError = getComponentMarkerError(answer)
		if (!markerError) return answer
		log(`  "${answer}" can't be used — ${markerError}.`)
	}
}

/**
 * Tell a Lit user that their answer to the marker question was not recorded,
 * and what their config has to say for it to hold.
 *
 * Printed when the wizard finished without writing the key, which happens two
 * ways, and **the two put different answers at risk**:
 *
 * - **An existing config blocked the write.** Both answers are at risk. A
 *   marker needs the key present and clearing one needs it absent, and that
 *   file may say either — this never reads it, so the note asks the user to
 *   check rather than telling them what it holds.
 * - **The write failed.** Only a marker is at risk. That throw is reachable
 *   only past the existing-file check, so there is no config file, the key is
 *   absent, and a cleared answer already holds without being told. The caller
 *   gates that site on a marker for exactly this reason, which is why the two
 *   gates differ and neither is the other's bug.
 *
 * @param litComponentSuffix - the answer, or the empty string for no marker
 */
function logLitComponentSuffixNote(litComponentSuffix: string) {
	if (!litComponentSuffix) {
		log(
			`    Ensure your sb-deps.config does NOT set \`litComponentSuffix\` — you asked`,
		)
		log(
			`    for no marker, and that is what an absent key means. With one set, only`,
		)
		log(`    files named for it are components.`)
		return
	}
	log(
		`    Ensure your sb-deps.config sets \`litComponentSuffix: '${litComponentSuffix}'\` — without`,
	)
	log(
		`    that key any plain .ts file you create empty under your source folder is`,
	)
	log(
		`    treated as a component, rather than only the ones there named *.${litComponentSuffix}.ts.`,
	)
}

/**
 * How each `.tsx` flavor is spelled in the note below. A lookup rather than a
 * capitalisation of the config value, so nothing has to work out where the
 * capitals go.
 */
const TSX_FRAMEWORK_NAMES: Record<TsxFramework, string> = {
	react: 'React',
	solid: 'Solid',
	preact: 'Preact',
}

/**
 * Tell a Solid or Preact user to set `tsxFramework` themselves.
 *
 * Printed when the wizard finished without writing the key — the write failed,
 * or an existing config blocked it — AND the wizard could not work the
 * framework out from the project's own files, so the user supplied it. The
 * scaffolder repeats that same detection, so where it succeeds it emits that
 * framework's templates whether or not the key is there; where it came up
 * empty, the key is the only thing left saying so, and a missing one is silent.
 * The wizard does not read an existing config, so this asks the user to check
 * rather than claiming the key is absent.
 */
function logTsxFrameworkNote(tsxFramework: TsxFramework) {
	const frameworkName = TSX_FRAMEWORK_NAMES[tsxFramework]
	log(
		`    Ensure your sb-deps.config sets \`tsxFramework: '${tsxFramework}'\` — the scaffolder`,
	)
	log(
		`    could not tell this is a ${frameworkName} project, so without that key it emits`,
	)
	log(`    React (not ${frameworkName}) templates for .tsx files.`)
}
