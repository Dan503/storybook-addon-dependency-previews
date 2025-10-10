#!/usr/bin/env node

/* eslint-disable no-console */
const { execSync, spawn } = require('node:child_process')
const {
	existsSync,
	mkdirSync,
	writeFileSync,
	statSync,
	readFileSync,
} = require('node:fs')
const { resolve, join, dirname, posix, sep, basename } = require('node:path')
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

const cliDir = dirname(__filename)
const pkgDefault = resolve(cliDir, 'scripts', 'depcruise.config.cjs')
const overrideCandidates = [
	resolve(projectRoot, 'depcruise.config.cjs'),
	resolve(projectRoot, '.dependency-cruiser.js'),
	resolve(projectRoot, '.dependency-cruiser.cjs'),
]
const configPath =
	overrideCandidates.find((p) => existsSync(p)) ||
	(existsSync(pkgDefault) ? pkgDefault : null)

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
		runDepCruiseOnce()
		postprocessOnce()
	} catch (e) {
		error('build failed')
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

function componentBaseFromComponent(absCompPath) {
	return basename(absCompPath, '.tsx')
}

function detectAtomicTag(absPath) {
	const hay = absPath.toLowerCase().replace(/\\/g, '/')
	const tokens = ['atom', 'molecule', 'organism', 'template', 'page']
	let best = null
	for (const t of tokens) {
		const idx = hay.lastIndexOf(t)
		if (idx !== -1 && (best === null || idx > best.idx))
			best = { val: t, idx }
	}
	return best ? best.val : null
}

function storyPathForComponent(absCompPath) {
	const dir = dirname(absCompPath)
	const base = componentBaseFromComponent(absCompPath)
	return join(dir, `${base}.stories.tsx`)
}

function makeTitleFromComponent(absCompPath) {
	const srcRoot = join(projectRoot, 'src') + sep
	const normAbs = absCompPath.replace(/\\/g, '/')
	const relFromSrc = normAbs.startsWith(srcRoot.replace(/\\/g, '/'))
		? normAbs.slice(srcRoot.length)
		: absCompPath.replace(projectRoot + sep, '').replace(/\\/g, '/')

	const dir = posix.dirname(relFromSrc)
	let segments = dir.split('/').filter(Boolean)
	if (segments[0] && /^components?$/i.test(segments[0]))
		segments = segments.slice(1)

	const titledFolders = segments.map((s) => toTitleCase(toWords(s)))
	const compName = componentBaseFromComponent(absCompPath)
	const compTitle = toTitleCase(toWords(compName))

	const fullStoryPath = [...titledFolders, compTitle].filter(Boolean)

	// remove duplicates (e.g. Folder/Thing/Thing => Folder/Thing)
	const dedupedStoryPath = [...new Set(fullStoryPath)]

	return dedupedStoryPath.join(' / ')
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

	const storyTpl = `import type { Meta, StoryObj } from '@storybook/react-vite'
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

type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {} satisfies ${propsName},
}
`
	const storyPath = storyPathForComponent(absCompPath)
	writeFileSync(storyPath, storyTpl, 'utf8')
	info(`scaffolded story → ${rel(storyPath)}`)
	return storyPath
}

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
	const includeGlobs = [
		'**/*.stories.{ts,tsx,js,jsx,mdx,svelte}',
		'**/*.story.{ts,tsx,js,jsx,mdx,svelte}',
		'src/**/*.{ts,tsx,js,jsx,svelte}',
		'depcruise.config.cjs',
		'.dependency-cruiser.{js,cjs}',
	]
	const ignoreGlobs = [
		'node_modules/**',
		'.git/**',
		'.storybook/**',
		'**/.cache/**',
		'**/dist/**',
		'**/build/**',
	]

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
			async (err, events) => {
				if (err) {
					error(`watch error ${err?.message || err}`)
					return
				}

				let isDeletingFile = false

				for (const ev of events) {
					const abs = ev.path
					const relPath = rel(abs)
					if (!micromatch.isMatch(relPath, includeGlobs)) continue

					if (ev.type === 'delete') {
						console.log('Deleted:', relPath)
						isDeletingFile = true
						kick('unlink', abs)
						continue
					}

					// COMPONENT CREATE — scaffold if empty and ensure story
					if (isComponentsTsx(abs) && ev.type === 'create') {
						handleComponentCreation()

						async function handleComponentCreation() {
							if (isEmptyOrWhitespace(abs)) {
								scaffoldComponent(abs)
							}

							// wait a bit for a possible rename
							await wait(200)

							// Skip if likely rename
							if (isDeletingFile) {
								console.log('Rename detected for:', relPath)
								info(
									`suppressed scaffolding (component rename): ${relPath}`,
								)
								return
							}
							console.log('Component creation detected:', relPath)
							const createdStory = ensureStoryForComponent(abs)
							if (createdStory) {
								isDeletingFile = false
								kick('create:story', createdStory)
								return
							}
						}
					}

					// normal rebuild
					kick(ev.type, abs)
				}
			},
			{ ignore: ignoreGlobs },
		)
		.then(() => info('watching… (ready)'))
		.catch((e) => error(`watch init failed ${e?.message || e}`))
}

// ───────────────────────────────────────────────────────────────────────────────
// Storybook child
// ───────────────────────────────────────────────────────────────────────────────
let sbChild = null
function startStorybook() {
	let sbEntry = null
	try {
		sbEntry = require.resolve('storybook/bin/index.cjs', {
			paths: [projectRoot],
		})
	} catch {
		try {
			sbEntry = require.resolve('@storybook/cli/bin/index.js', {
				paths: [projectRoot],
			})
		} catch {}
	}

	if (sbEntry) {
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
		const isWin = process.platform === 'win32'
		const cmd = isWin ? 'npx.cmd' : 'npx'
		sbChild = spawn(cmd, ['storybook', 'dev', '-p', String(SB_PORT)], {
			cwd: projectRoot,
			stdio: 'inherit',
			env: process.env,
		})
		info(`storybook (npx) running on http://localhost:${SB_PORT}`)
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
if (WATCH) watcher = startWatcher()
if (RUN_SB) startStorybook()

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
function wait(time = 500) {
	return new Promise((r) => setTimeout(r, time))
}
