#!/usr/bin/env node

/* eslint-disable no-console */
const { execSync, spawn } = require('node:child_process')
const { existsSync, mkdirSync, writeFileSync, statSync } = require('node:fs')
const { resolve, join, dirname, posix, sep, basename } = require('node:path')
const { readFileSync } = require('node:fs')
const watcherParcel = require('@parcel/watcher')
const micromatch = require('micromatch')

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
	info(`compiled ✓ → ${rel(cookedPath)} (${ms(Date.now() - start)})`)
}

function buildOnce() {
	try {
		console.log('buildOnce')
		runDepCruiseOnce()
		postprocessOnce()
	} catch (e) {
		error('build failed')
		// don’t throw in watch mode; keep the watcher alive
		if (!WATCH) throw e
	}
}

// ───────────────────────────────────────────────────────────────────────────────
// Utils
// ───────────────────────────────────────────────────────────────────────────────

// Split words out of Pascal/camel/kebab/snake
function toWords(input) {
	return String(input)
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2') // fooBar -> foo Bar
		.replace(/[_\-./]+/g, ' ') // kebab/snake/dots -> spaces
		.trim()
		.split(/\s+/)
}

function toTitleCase(words) {
	return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function toPascalCase(input) {
	return toTitleCase(toWords(input)).replace(/\s+/g, '')
}

// src/components/Foo/Bar/BazButton.stories.tsx -> "BazButton"
function componentBaseFromStory(absPath) {
	const base = basename(absPath)
	return base.replace(/\.(stories|story)\.\w+$/i, '')
}

// Build a Storybook title from folder path + component name
function makeStoryTitle(absPath) {
	// 1) get path relative to src (prefer), else project root
	const relFromSrc = (() => {
		const srcRoot = join(projectRoot, 'src') + sep
		const norm = absPath.replace(/\\/g, '/')
		const normSrc = srcRoot.replace(/\\/g, '/')
		return norm.startsWith(normSrc) ? norm.slice(normSrc.length) : null
	})()

	const relPath =
		relFromSrc || absPath.replace(projectRoot + sep, '').replace(/\\/g, '/')

	// 2) drop file name, split folders
	const dir = posix.dirname(relPath) // use posix to normalize `/`
	let segments = dir.split('/').filter(Boolean)

	// 3) optional pruning: drop leading "components" (tweak to taste)
	if (segments[0] && /^components?$/i.test(segments[0]))
		segments = segments.slice(1)

	// 4) Title-case each folder segment
	const titledFolders = segments.map((s) => toTitleCase(toWords(s)))

	// 5) Add the component name (last segment)
	const compBase = componentBaseFromStory(absPath)
	const compTitle = toTitleCase(toWords(compBase))

	// 6) Join with slashes
	const parts = [...titledFolders, compTitle].filter(Boolean)
	return parts.join(' / ')
}

// true if file is 0 bytes or only whitespace
function isEmptyOrWhitespace(absPath) {
	try {
		const s = statSync(absPath)
		if (s.size === 0) return true
		const txt = readFileSync(absPath, 'utf8')
		return !txt.trim()
	} catch {
		return true
	}
}

// ───────────────────────────────────────────────────────────────────────────────
// Story scaffolding
// ───────────────────────────────────────────────────────────────────────────────

function scaffoldStory(absPath) {
	const base = componentBaseFromStory(absPath)
	const componentName = toPascalCase(base)
	const title = makeStoryTitle(absPath) // ← smart path-based title

	const tpl = `import type { Meta } from '@storybook/react-vite'
 import { ${componentName}, type ${componentName}Props } from './${componentName}'

 const meta: Meta<typeof ${componentName}> = {
	title: '${title}',
	component: ${componentName},
	tags: ['autodocs', 'atom/molecule/organism'],
	parameters: {
	  __filePath: import.meta.url,
	},
 }
 
 export default meta
 
 export const Default = {
	args: {} satisfies ${componentName}Props,
 }
 `

	writeFileSync(absPath, tpl, 'utf8')
	info(`scaffolded template → ${rel(absPath)}`)
}

// ───────────────────────────────────────────────────────────────────────────────
// Watcher
// ───────────────────────────────────────────────────────────────────────────────

function startWatcher() {
	const root = projectRoot

	// Globs we *care* about (everything else is ignored)
	const includeGlobs = [
		'**/*.stories.{ts,tsx,js,jsx,mdx,svelte}',
		'**/*.story.{ts,tsx,js,jsx,mdx,svelte}',
		'src/**/*.{ts,tsx,js,jsx,svelte}',
		'depcruise.config.cjs',
		'.dependency-cruiser.{js,cjs}',
	]

	// Globs we want to ignore
	const ignoreGlobs = [
		'node_modules/**',
		'.git/**',
		'.storybook/**', // avoid loops on our compiled JSON
		'**/.cache/**',
		'**/.storybook-cache/**',
		'**/.sb/**',
		'**/dist/**',
		'**/build/**',
		'**/~*',
		'**/#*#',
		'**/*.tmp', // editor temp files
	]

	const isStoryFile = (p) =>
		/\.stories\.\w+$/i.test(p) || /\.story\.\w+$/i.test(p)

	const hasDefaultExport = (absPath) => {
		try {
			const src = readFileSync(absPath, 'utf8')
			return /export\s+default\s+/m.test(src)
		} catch {
			return false
		}
	}

	const shouldInclude = (relPath) =>
		micromatch.isMatch(relPath, includeGlobs) &&
		!micromatch.isMatch(relPath, ignoreGlobs)

	let pending = false
	let timer = null
	const kick = (reason, absPath) => {
		if (pending) return
		pending = true
		if (timer) clearTimeout(timer)
		timer = setTimeout(() => {
			info(`${reason}: ${rel(absPath)}`)
			buildOnce()
			pending = false
		}, 120)
	}

	watcherParcel
		.subscribe(
			root,
			(err, events) => {
				if (err) {
					error(`watch error ${err?.message || err}`)
					return
				}

				for (const ev of events) {
					const abs = ev.path
					const relPath = rel(abs)

					if (!shouldInclude(relPath)) {
						// console.log('[sb-deps][skip]', ev.type, relPath)
						continue
					}
					// console.log('[sb-deps][event]', ev.type, relPath)

					if (ev.type === 'delete') {
						kick('unlink', abs)
						continue
					}

					const isStory = isStoryFile(relPath)

					// --- NEW: auto-template on create or still-empty change ---
					if (
						isStory &&
						(ev.type === 'create' || isEmptyOrWhitespace(abs))
					) {
						// Only scaffold for TS/TSX/JS/JSX stories (skip MDX/Svelte unless you want variants)
						if (/\.(stories|story)\.(ts|tsx|js|jsx)$/i.test(abs)) {
							scaffoldStory(abs)
						}
					}

					// After potential scaffold, skip builds if no default export yet
					if (isStory && !hasDefaultExport(abs)) {
						info(
							`${ev.type} story (missing default export) — skipping build: ${relPath}`,
						)
						continue
					}

					// Go rebuild
					kick(ev.type, abs)
				}
			},
			{
				ignore: ignoreGlobs,
				// backend: 'inotify', // let Parcel pick best backend (remove if it warns)
			},
		)
		.then(() => info('watching… (ready)'))
		.catch((e) => error(`watch init failed ${e?.message || e}`))
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
