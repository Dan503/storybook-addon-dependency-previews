/* eslint-disable no-console */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { relative as pathRelative } from 'node:path'

import {
	detectProject,
	isFrameworkSupported,
	isNextjsFramework,
	SUPPORTED_FRAMEWORKS,
	tsxFrameworkFromFramework,
	type Framework,
	type SupportedFramework,
} from './detect.js'
import { detectProjectRepoUrl } from './gitOrigin.js'
import { installMissingPackages } from './install.js'
import {
	patchMainFile,
	patchStoriesGlobForStoryExtension,
} from './patchers/main.js'
import { patchPackageJson } from './patchers/packageJson.js'
import { patchPreviewFile } from './patchers/preview.js'
import {
	writeSbDepsConfigIfNeeded,
	type SbDepsConfigPatchResult,
} from './patchers/sbDepsConfig.js'
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
 * Print the resolved source folder as one of the detection block's aligned
 * lines. Owns the label, the padding that lines it up with its neighbours, and
 * the empty-string sentinel for "the project root is the source folder" — which
 * would otherwise print as nothing at all. The framework picker prints this
 * line a second time when the pick changes the answer, so a single owner is
 * what stops the two drifting apart.
 */
function logSrcDir(srcDir: string) {
	log(`Source folder       : ${srcDir === '' ? '(project root)' : srcDir}`)
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
	'nextjs-vite': 'Next.js on Vite (@storybook/nextjs-vite)',
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
		case 'react-webpack5':
		case 'preact-vite':
		case 'solid-vite':
		case 'nextjs-webpack':
		case 'nextjs-vite':
			return 'tsx'
		// Angular and Vue fall through to `ts` — the Angular scaffolder strips
		// `.component` and emits `<Name>.stories.ts`, and Vue emits
		// `<Name>.stories.ts`, so `ComponentName.stories.ts` is the accurate
		// example. `unsupported` and `unknown` land here too, and for those it is
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
	// context is established. The framework picker further down resolves the
	// source folder a second time when the user picks Next.js, since the answer
	// here was reached without knowing that.
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

	let resolvedSrcDir = await resolveSrcDir(cwd, framework)
	logSrcDir(resolvedSrcDir.srcDir)
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
	// callouts where Angular and Next.js diverge (React on webpack follows the
	// Next.js lines).
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
			logSbDepsConfigOutcome(cfg, { separateWithRule: false })
		}
		return
	}

	if (framework === 'unsupported') {
		log(
			`This setup wizard currently supports React, Preact, Svelte, Vue 3, Solid, and Next.js on Vite (all Vite-based) only. Detected "${detection.frameworkRaw}".`,
		)
		log(
			'The addon itself also supports Angular, Next.js on webpack and React on webpack with a one-time manual setup — see https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/storybook-addon-package/docs/manual-setup-webpack.md.',
		)
		log(
			'If you would like to see wizard support added for your framework, please open an issue on GitHub.',
		)
		return
	}

	// Whether the framework was worked out from the project's own files, or
	// supplied by the user below. The closing note turns on it: the scaffolder
	// runs the same detection on every run, so where that came up empty it
	// scaffolds nothing at all and the user needs telling.
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
		// The source folder was resolved above against the framework detection
		// produced, which here was `unknown` — so it fell through to the default
		// `'src'` without probing anything. Next.js is the one framework that
		// answer can be wrong for (its source can sit in `app/`, `pages/`, or the
		// project root), so resolve it again now the user has said what the
		// project is, and show the answer where it replaces the one printed above
		// — a project that has a `src/` folder resolves to the same value again,
		// and re-printing it would read as though something had changed.
		if (isNextjsFramework(framework)) {
			const srcDirBeforePick = resolvedSrcDir.srcDir
			resolvedSrcDir = await resolveSrcDir(cwd, framework)
			if (resolvedSrcDir.srcDir !== srcDirBeforePick) {
				logSrcDir(resolvedSrcDir.srcDir)
			}
		}
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

	logStoriesGlobReminder(effectiveSrcDir)

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
	// not React — templates for `.tsx` files), or when the user chose a
	// non-default story-file extension. Must happen before Step 5 so the sb-deps
	// build below picks up the configured values on its first run. Silent no-op
	// when everything is default so setups without overrides don't see an extra
	// log line. Uses `effectiveSrcDir` so a user-edited value via the edit flow
	// is what gets persisted, not the auto-detected one.
	const tsxFramework = tsxFrameworkFromFramework(framework)
	const sbDepsConfigResult = writeSbDepsConfigIfNeeded({
		cwd,
		srcDir: effectiveSrcDir,
		isEsm: detection.isEsm,
		tsxFramework,
		storybookFileExtension: effectiveStorybookFileExtension,
	})
	logSbDepsConfigOutcome(sbDepsConfigResult, { separateWithRule: true })

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

	// Last, so it sits beside the "next steps" lines rather than above a package
	// manager's install output, and so it only reaches a user who went through
	// with the setup.
	if (!wasFrameworkDetected) logNoScaffoldingNote()

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

/**
 * Remind the user to point Storybook's own `stories` array at a source folder
 * that is not `src`.
 *
 * The addon's story glob and the dependency scan both get the resolved folder,
 * but the `stories` array is the project's own: the wizard never rewrites the
 * folder segment of it — it only ever widens the file extension there, for the
 * `.story.` naming — and where stories live is the project's decision, since a
 * project may keep them outside its source folder on purpose. The failure worth
 * heading off is silent: with that array still pointing at `src/` in a project
 * whose source is in `app/`, Storybook lists none of the project's stories, so
 * there is no page for the previews panel to appear on, and every step of this
 * wizard prints a tick regardless.
 *
 * Said rather than checked, deliberately. Storybook's entries are a string glob
 * or an object naming a directory, either can hold glob syntax that decides the
 * answer, and the file may be written any way its author likes — so a check
 * would be wrong in both directions, and the expensive direction is the false
 * warning that sends someone with a correct config to go and break it. A line
 * that makes no claim about what the array says cannot be wrong about it.
 *
 * Skipped only for the `src` default, which is what the array already names in
 * a project that has one. Project-root mode gets it like any other answer —
 * nothing in the wizard makes that array agree with the source folder, whatever
 * the folder turned out to be, and an array naming `src/` in a project whose
 * components sit at the root matches nothing.
 *
 * @param srcDir - the resolved source folder, after any edit-flow override
 */
function logStoriesGlobReminder(srcDir: string) {
	if (srcDir === 'src') return
	const target = srcDir === '' ? 'the project root' : `'${srcDir}/'`
	log(
		`  • Storybook lists stories from the \`stories\` array in main.ts, which is`,
	)
	log(
		`    yours to set — check it covers ${target}, or it will list none of them.`,
	)
}

/**
 * Report what came of a `sb-deps.config` write, at whichever of the two places
 * the wizard attempts one — the webpack bail-out and Step 4.
 *
 * One owner rather than a switch at each site: the two say the same things
 * about the same result type, and the one time they were written out separately
 * they drifted, the outcomes of a single write printing at two indents. Every
 * line here is indented two spaces so they line up with each other and with the
 * step's own lines.
 *
 * `skipped` prints nothing on purpose — it means there was nothing worth
 * writing and nothing to tell the user.
 *
 * @param result - what `writeSbDepsConfigIfNeeded` returned
 * @param separateWithRule - whether to draw a divider first; Step 4 sits in a
 * run of them, while the bail-out has already printed its own lines
 */
function logSbDepsConfigOutcome(
	result: SbDepsConfigPatchResult,
	{ separateWithRule }: { separateWithRule: boolean },
) {
	if (result.kind === 'skipped') return
	if (separateWithRule) rule()
	if (result.kind === 'created') {
		log(`  ✓ wrote ${result.path} (${result.fields.join(', ')})`)
	} else if (result.kind === 'blocked') {
		logBlockedConfigNote(result.existingFileName, result.fields)
	} else {
		log(`  ⚠ ${result.reason}`)
		// Name what was lost rather than one field of three — `srcDir` may be the
		// one value that was never going in. And no promise about what happens
		// next: this runs at Step 4, where the wizard carries on, and at the
		// webpack bail-out, which returns immediately afterwards.
		if (result.fields.length > 0) {
			log(
				`    Set these in an sb-deps.config yourself: ${result.fields.join(', ')}`,
			)
		}
	}
}

/**
 * Tell the user that an existing config file stopped the wizard recording what
 * it worked out, and name the values it could not write.
 *
 * The one that matters is the source folder: the wizard may have just asked for
 * it, and a blocked write means it reaches the preview file's story glob but
 * never reaches the dependency scan. Where the scan then looks depends on what
 * the existing config says, and on a project whose source is in `app/` it can
 * match nothing at all — with every step still reporting success, so saying
 * nothing here would leave the user with a broken setup and no sign of why.
 *
 * @param existingFileName - the config file already in the project root
 * @param fields - the unwritten values the user can put back, e.g. `["srcDir: 'app'"]`
 */
function logBlockedConfigNote(
	existingFileName: string,
	fields: ReadonlyArray<string>,
) {
	log(`  ⚠ ${existingFileName} already exists, so it was left alone.`)
	// "Check that it sets", not "add these": the file is never opened, so the
	// key may already be there — most likely written by a previous run of this
	// same wizard, which would have resolved the same value.
	log(`    Check that it sets: ${fields.join(', ')}`)
}

/**
 * Warn a user who had to pick their framework that auto-scaffolding will not
 * run in this project.
 *
 * Printed on the picker path, which is reached when the wizard could not work
 * the framework out from the project's own files. The scaffolder repeats that
 * same detection on every run and has nothing but the project to go on — the
 * config file it may write carries a source folder, a `.tsx` flavour and a
 * story-file extension, none of which name the framework — so it comes up
 * `unknown` too, and `checkDoesFileFrameworkMatchProject` in `sb-deps.ts` turns
 * every new component and story file away rather than scaffolding it as the
 * wrong framework. Nothing else depends on scaffolding — the dependency graph,
 * the previews panel and the story links do not — so the note says so rather
 * than claiming this particular run succeeded, since it also prints after a
 * failed Step 5.
 *
 * Not framework-specific — it holds for every framework the picker offers,
 * because what defeats the scaffolder is the failed detection rather than the
 * answer the user gave.
 */
function logNoScaffoldingNote() {
	rule()
	log(`  ⚠ Auto-scaffolding of new components and stories will not run in this`)
	log(
		`    project. sb-deps works the framework out from the project's own files`,
	)
	log(`    each run, the same way this wizard could not, so it turns new files`)
	log(
		`    away rather than scaffolding them as the wrong framework. Nothing else`,
	)
	log(`    depends on it — the dependency graph and the previews panel do not.`)
}
