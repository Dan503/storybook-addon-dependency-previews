#!/usr/bin/env node
/* eslint-disable no-console */
const { execSync } = require('node:child_process')
const { existsSync, mkdirSync, writeFileSync } = require('node:fs')
const { resolve, join, dirname } = require('node:path')

const projectRoot = process.cwd()
const outDir = resolve(projectRoot, '.storybook')
const rawPath = join(outDir, 'dependency-previews.raw.json')
const cookedPath = join(outDir, 'dependency-previews.json')

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

// 1) Resolve depcruiser config with sensible fallbacks
const cliDir = dirname(__filename)
const pkgDefault = resolve(cliDir, 'scripts', 'depcruise.config.cjs') // bundled with addon
const overrideCandidates = [
	resolve(projectRoot, 'depcruise.config.cjs'),
	resolve(projectRoot, '.dependency-cruiser.js'),
	resolve(projectRoot, '.dependency-cruiser.cjs'),
]

const configPath =
	overrideCandidates.find((p) => existsSync(p)) ||
	(existsSync(pkgDefault) ? pkgDefault : null)

// 2) Run dependency-cruiser and capture stdout (no '>' shell redirection)
try {
	const cfgFlag = configPath ? `--config "${configPath}"` : '--no-config'
	const cmd = `npx depcruise . ${cfgFlag} --output-type json`
	const stdout = execSync(cmd, {
		cwd: projectRoot,
		stdio: ['ignore', 'pipe', 'inherit'],
		encoding: 'utf8',
	})
	writeFileSync(rawPath, stdout, 'utf8')
	console.log(`\nRaw dependencies graph written to:\n ${rawPath}`)
} catch (e) {
	console.error('\nFailed to generate dependencies graph.\n')
	throw e
}

// 3) Post-process raw → cooked using the addon’s script
try {
	const post = resolve(cliDir, '..', 'cli', 'scripts', 'postprocess.mjs')
	const postCmd = `node "${post}" "${rawPath}" "${cookedPath}"`
	execSync(postCmd, { cwd: projectRoot, stdio: 'inherit' })
	console.log(`\nDependency previews written to:\n${cookedPath}`)
} catch (e) {
	console.error('\nFailed while post-processing dependency graph.\n')
	throw e
}
