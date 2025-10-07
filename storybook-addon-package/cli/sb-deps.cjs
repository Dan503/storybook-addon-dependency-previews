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

function toWords(input) {
	return String(input)
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/[_\-./]+/g, ' ')
		.trim()
		.split(/\s+/)
}
function toTitleCase(words) {
	return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}
function toPascalCase(input) {
	return toTitleCase(toWords(input)).replace(/\s+/g, '')
}

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

// src/components/**/Thing.tsx ? (and not a story file)
function isComponentsTsx(absPath) {
	const norm = absPath.replace(/\\/g, '/')
	return (
		/\/src\/components\/.+\.tsx$/i.test(norm) &&
		!/\.stories?\.tsx$/i.test(norm)
	)
}

/** e.g. /foo/Bar.tsx → "Bar" */
function componentBaseFromComponent(absCompPath) {
	return basename(absCompPath, '.tsx')
}

/** e.g. /foo/Bar.stories.tsx → "Bar" */
function componentBaseFromStory(absStoryPath) {
	const base = basename(absStoryPath)
	return base.replace(/\.(stories|story)\.\w+$/i, '')
}

/** detect atomic token nearest to the end of the path */
function detectAtomicTag(absPath) {
	const hay = absPath.toLowerCase().replace(/\\/g, '/')
	const tokens = ['atom', 'molecule', 'organism', 'template', 'page']
	let best = null
	for (const t of tokens) {
		const idx = hay.lastIndexOf(t)
		if (idx !== -1 && (best === null || idx > best.idx)) {
			best = { val: t, idx }
		}
	}
	return best ? best.val : null
}

/** path for sibling story file */
function storyPathForComponent(absCompPath) {
	const dir = dirname(absCompPath)
	const base = componentBaseFromComponent(absCompPath)
	return join(dir, `${base}.stories.tsx`)
}

/** title from folder (relative to src) + component name */
function makeTitleFromComponent(absCompPath) {
	const srcRoot = join(projectRoot, 'src') + sep
	const normAbs = absCompPath.replace(/\\/g, '/')
	const relFromSrc = normAbs.startsWith(srcRoot.replace(/\\/g, '/'))
		? normAbs.slice(srcRoot.length)
		: absCompPath.replace(projectRoot + sep, '').replace(/\\/g, '/')

	const dir = posix.dirname(relFromSrc)
	let segments = dir.split('/').filter(Boolean)

	// drop leading "components" for nicer titles (tweak to taste)
	if (segments[0] && /^components?$/i.test(segments[0]))
		segments = segments.slice(1)

	const titledFolders = segments.map((s) => toTitleCase(toWords(s)))
	const compName = componentBaseFromComponent(absCompPath)
	const compTitle = toTitleCase(toWords(compName))
	return [...titledFolders, compTitle].filter(Boolean).join(' / ')
}

// ───────────────────────────────────────────────────────────────────────────────
// Story & component scaffolding
// ───────────────────────────────────────────────────────────────────────────────

function scaffoldComponent(absCompPath) {
	const base = componentBaseFromComponent(absCompPath)
	const componentName = toPascalCase(base)
	const propsName = `PropsFor${componentName}`

	const tpl = `import type { ReactNode } from 'react'

export interface ${propsName} {
	children?: ReactNode
}

export function ${componentName}({ children }: ${propsName}) {
	return (
		<div>
			<p>${componentName}</p>
			{children}
		</div>
	)
}
`
	writeFileSync(absCompPath, tpl, 'utf8')
	info(`scaffolded component → ${rel(absCompPath)}`)
}

function scaffoldStoryForComponent(absCompPath) {
	const base = componentBaseFromComponent(absCompPath)
	const componentName = toPascalCase(base)
	const propsName = `PropsFor${componentName}`
	const title = makeTitleFromComponent(absCompPath)
	const atomic = detectAtomicTag(absCompPath)

	const tags = ['autodocs']
	if (atomic) tags.push(atomic)

	const storyTpl = `import type { Meta } from '@storybook/react-vite'
import { ${componentName}, type ${propsName} } from './${componentName}'

const meta: Meta<typeof ${componentName}> = {
	title: '${title}',
	component: ${componentName},
	tags: ${JSON.stringify(tags)},
	parameters: {
		__filePath: import.meta.url,
	},
}

export default meta

export const Default = {
	args: {} satisfies ${propsName},
}
`
	const storyPath = storyPathForComponent(absCompPath)
	writeFileSync(storyPath, storyTpl, 'utf8')
	info(`scaffolded story → ${rel(storyPath)}`)
	return storyPath
}

function scaffoldStoryOnly(absPath) {
	const base = componentBaseFromStory(absPath)
	const componentName = toPascalCase(base)
	const propsName = `PropsFor${componentName}`
	const title = makeTitleFromComponent(absPath) // ← smart path-based title
	const atomic = detectAtomicTag(absPath)

	const tags = ['autodocs']
	if (atomic) tags.push(atomic)

	const tpl = `import type { Meta } from '@storybook/react-vite'
import { ${componentName}, type ${propsName} } from './${componentName}'

 const meta: Meta<typeof ${componentName}> = {
	title: '${title}',
	component: ${componentName},
	tags: ${JSON.stringify(tags)},
	parameters: {
		__filePath: import.meta.url,
	},
}

export default meta

export const Default = {
	args: {} satisfies ${propsName},
}
`

	writeFileSync(absPath, tpl, 'utf8')
	info(`scaffolded template → ${rel(absPath)}`)
}

/** ensure story exists for component; return created path or null */
function ensureStoryForComponent(absCompPath) {
	const sPath = storyPathForComponent(absCompPath)
	if (existsSync(sPath)) return null
	return scaffoldStoryForComponent(absCompPath)
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

					// if a component .tsx was created (or created empty), scaffold it,
					// then ensure a sibling story exists
					if (isComponentsTsx(abs) && ev.type === 'create') {
						if (isEmptyOrWhitespace(abs)) {
							scaffoldComponent(abs)
						}
						const createdStory = ensureStoryForComponent(abs)
						if (createdStory) {
							// kick a rebuild because a new story was added
							kick('create:story', createdStory)
							continue
						}
					}

					// existing behavior: scaffold story files that are empty/new (manual story creation)
					if (
						isStory &&
						(ev.type === 'create' || isEmptyOrWhitespace(abs))
					) {
						if (/\.(stories|story)\.(ts|tsx|js|jsx)$/i.test(abs)) {
							// this version expects a STORY path; if you kept your old scaffoldStory(path),
							// call that here; otherwise you can derive a component path and call the
							// *for component* variant as needed.
							// For simplicity you can re-use the component version by mapping story → component:
							const compPathGuess = abs.replace(
								/\.(stories|story)\.(ts|tsx|js|jsx)$/i,
								'.tsx',
							)
							if (existsSync(compPathGuess)) {
								scaffoldStoryForComponent(compPathGuess)
								kick('create:story', abs)
								continue
							}
						}
					}

					// --- If a story file is created without first creating a component file, we scaffold only the story ---
					if (
						isStory &&
						(ev.type === 'create' || isEmptyOrWhitespace(abs))
					) {
						// Only scaffold for TS/TSX/JS/JSX stories (skip MDX/Svelte unless you want variants)
						if (/\.(stories|story)\.(ts|tsx|js|jsx)$/i.test(abs)) {
							scaffoldStoryOnly(abs)
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
