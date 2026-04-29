/* eslint-disable no-console */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'

import { detectProject, isFrameworkSupported, type Framework } from './detect.js'
import { installMissingPackages } from './install.js'
import { patchMainFile } from './patchers/main.js'
import { patchPackageJson } from './patchers/packageJson.js'
import { patchPreviewFile } from './patchers/preview.js'
import { choose, confirm, input } from './prompt.js'

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

	log(`Detected framework : ${detection.frameworkRaw ?? '(unknown)'}`)
	log(`Detected pkg manager: ${detection.packageManager}`)
	log(`Storybook main file: ${detection.mainFile.path}`)
	log(
		`Preview file       : ${detection.previewFile?.path ?? '(does not exist — will be created)'}`,
	)
	rule()

	let framework: Framework = detection.framework

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
		hasAddonInstalled: detection.hasAddonInstalled,
		hasDependencyCruiserInstalled: detection.hasDependencyCruiserInstalled,
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
			log(
				`  ✓ added 'storybook-addon-dependency-previews/addon' (${mainResult.appliedTo})`,
			)
			break
		case 'skipped':
			log(`  ✓ ${mainResult.reason}`)
			break
		case 'failed':
			log(`  ✗ ${mainResult.reason}`)
			log(
				'  Add `\'storybook-addon-dependency-previews/addon\'` to your `addons:` array manually, then re-run.',
			)
			process.exit(1)
	}

	rule()
	log('Step 3/5: configuring preview file')
	const sourceRootUrl = await input(
		'Source root URL (e.g. https://github.com/your-org/your-repo/blob/main/src) — leave blank for no source links:',
		'',
	)
	const previewResult = patchPreviewFile({
		storybookDir: detection.storybookDir,
		previewFile: detection.previewFile,
		mainFile: detection.mainFile,
		framework,
		sourceRootUrl,
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
