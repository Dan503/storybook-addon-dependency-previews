#!/usr/bin/env node

/* eslint-disable no-console */
const { execSync, spawn } = require('node:child_process')
const chokidar = require('chokidar')
const { existsSync, mkdirSync, writeFileSync } = require('node:fs')
const { resolve, join, dirname } = require('node:path')

// ───────────────────────────────────────────────────────────────────────────────
// Args
// ───────────────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2)
const WATCH = argv.includes('--watch')
const RUN_SB = argv.includes('--run-storybook')
const PORT_ARGI = Math.max(argv.indexOf('--sb-port'), 0)
const SB_PORT =
	PORT_ARGI && argv[PORT_ARGI + 1]
		? Number(argv[PORT_ARGI + 1]) || 6006
		: 6006

// ───────────────────────────────────────────────────────────────────────────────
// Paths
// ───────────────────────────────────────────────────────────────────────────────
const projectRoot = process.cwd()
const outDir = resolve(projectRoot, '.storybook')
const rawPath = join(outDir, 'dependency-previews.raw.json')
const cookedPath = join(outDir, 'dependency-previews.json')

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

// Resolve depcruiser config with sensible fallbacks
const cliDir = dirname(__filename)
const pkgDefault = resolve(cliDir, 'scripts', 'depcruise.config.cjs') // bundled
const overrideCandidates = [
	resolve(projectRoot, 'depcruise.config.cjs'),
	resolve(projectRoot, '.dependency-cruiser.js'),
	resolve(projectRoot, '.dependency-cruiser.cjs'),
]
const configPath =
	overrideCandidates.find((p) => existsSync(p)) ||
	(existsSync(pkgDefault) ? pkgDefault : null)

// Postprocess script inside the addon package
const post = resolve(cliDir, '..', 'cli', 'scripts', 'postprocess.mjs')

// ───────────────────────────────────────────────────────────────────────────────
// Runners
// ───────────────────────────────────────────────────────────────────────────────
function runDepCruiseOnce() {
	const cfgFlag = configPath ? `--config "${configPath}"` : '--no-config'
	const cmd = `npx depcruise . ${cfgFlag} --output-type json`
	const start = Date.now()
	const stdout = execSync(cmd, {
		cwd: projectRoot,
		stdio: ['ignore', 'pipe', 'inherit'],
		encoding: 'utf8',
	})
	writeFileSync(rawPath, stdout, 'utf8')
	info(`graph ✓ (${ms(Date.now() - start)})`)
}

function postprocessOnce() {
	const start = Date.now()
	const postCmd = `node "${post}" "${rawPath}" "${cookedPath}"`
	execSync(postCmd, { cwd: projectRoot, stdio: 'inherit' })
	info(`cooked ✓ → ${rel(cookedPath)} (${ms(Date.now() - start)})`)
}

function buildOnce() {
	try {
		runDepCruiseOnce()
		postprocessOnce()
	} catch (e) {
		error('build failed')
		// don’t throw in watch mode; keep the watcher alive
		if (!WATCH) throw e
	}
}

// ───────────────────────────────────────────────────────────────────────────────
// Watcher
// ───────────────────────────────────────────────────────────────────────────────
function startWatcher() {
	// Stories + potential component changes that affect deps
	const globs = [
		// stories
		'**/*.stories.@(ts|tsx|js|jsx|mdx)',
		'**/*.story.@(ts|tsx|js|jsx)',
		// components (adjust as you see fit)
		'src/**/*.@(ts|tsx|js|jsx)',
		// configs affecting cruise
		'depcruise.config.cjs',
		'.dependency-cruiser.@(js|cjs)',
	]

	const watcher = chokidar.watch(globs, {
		cwd: projectRoot,
		ignoreInitial: true,
		awaitWriteFinish: { stabilityThreshold: 150, pollInterval: 50 },
	})

	let pending = false
	let timer = null
	const kick = (reason, file) => {
		if (pending) return
		pending = true
		if (timer) clearTimeout(timer)
		timer = setTimeout(() => {
			info(`${reason}: ${file ? rel(file) : ''}`.trim())
			buildOnce()
			pending = false
		}, 120) // debounce a touch
	}

	watcher
		.on('add', (p) => kick('add', p))
		.on('change', (p) => kick('change', p))
		.on('unlink', (p) => kick('unlink', p))
		.on('error', (e) => error(`watch error ${e?.message || e}`))

	info('watching…')
	return watcher
}

// ───────────────────────────────────────────────────────────────────────────────
// Storybook child (optional)
// ───────────────────────────────────────────────────────────────────────────────
let sbChild = null

function startStorybook() {
	// 1) Try to resolve the local Storybook CLI entry under the example-site
	let sbEntry = null
	try {
		// SB v8/9 entry points (try both just in case)
		// v9 path:
		sbEntry = require.resolve('storybook/bin/index.cjs', {
			paths: [projectRoot],
		})
	} catch {
		try {
			// v8 fallback:
			sbEntry = require.resolve('@storybook/cli/bin/index.js', {
				paths: [projectRoot],
			})
		} catch {}
	}

	if (sbEntry) {
		// Launch via Node (works cross-platform, avoids shell/npx quirks)
		sbChild = spawn(
			process.execPath,
			[sbEntry, 'dev', '-p', String(SB_PORT)],
			{
				cwd: projectRoot,
				stdio: 'inherit',
				env: process.env,
			},
		)
		info(`storybook (node) running on http://localhost:${SB_PORT}`)
	} else {
		// 2) Fallback to npx. On Windows this can still be flaky, so allow shell:true
		const isWin = process.platform === 'win32'
		const cmd = isWin ? 'npx.cmd' : 'npx'
		try {
			sbChild = spawn(cmd, ['storybook', 'dev', '-p', String(SB_PORT)], {
				cwd: projectRoot,
				stdio: 'inherit',
				env: process.env,
			})
			info(`storybook (npx) running on http://localhost:${SB_PORT}`)
		} catch (e) {
			// Last-ditch: shell mode with a single string fixes EINVAL on some setups
			const cmdline = `npx storybook dev -p ${SB_PORT}`
			sbChild = spawn(cmdline, {
				cwd: projectRoot,
				stdio: 'inherit',
				env: process.env,
				shell: true,
			})
			info(`storybook (shell) running on http://localhost:${SB_PORT}`)
		}
	}

	sbChild.on('exit', (code, sig) => {
		info(`storybook exited (${sig || code})`)
		sbChild = null
	})
}

// ───────────────────────────────────────────────────────────────────────────────
// Boot
// ───────────────────────────────────────────────────────────────────────────────
banner('sb-deps')
info(`outDir: ${rel(outDir)}`)
info(configPath ? `config: ${rel(configPath)}` : 'config: (none)')

buildOnce()

let watcher = null
if (WATCH) {
	watcher = startWatcher()
}
if (RUN_SB) {
	startStorybook()
}

// Graceful shutdown
process.on('SIGINT', () => {
	console.log()
	info('shutting down…')
	watcher?.close().catch(() => {})
	if (sbChild) {
		try {
			sbChild.kill('SIGINT')
		} catch {}
	}
	process.exit(0)
})

// ───────────────────────────────────────────────────────────────────────────────
// Utils
// ───────────────────────────────────────────────────────────────────────────────
function rel(p) {
	return p.replace(resolve(projectRoot) + require('path').sep, '')
}
function ms(n) {
	return `${Math.max(1, Math.round(n))}ms`
}
function info(msg) {
	console.log('[sb-deps]', msg)
}
function error(msg) {
	console.error('[sb-deps]', msg)
}
function banner(title) {
	console.log(`\n${title} – dependency previews\n`)
}
