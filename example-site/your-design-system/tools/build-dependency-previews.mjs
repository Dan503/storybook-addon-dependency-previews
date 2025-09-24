#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const outDir = resolve(root, '.storybook')
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

const rawPath = resolve(outDir, 'dependency-previews.raw.json')
const cookedPath = resolve(outDir, 'dependency-previews.json')

// 1) Crawl the project using dependency-cruiser
execSync(`depcruise src --include-only 'src' --output-type json > ${rawPath}`, {
	stdio: 'inherit',
	cwd: root,
})

// 2) Post-process raw deps
execSync(
	`node ./tools/dependency-previews-postprocess.mjs ${rawPath} ${cookedPath}`,
	{
		stdio: 'inherit',
		cwd: root,
	},
)

console.log(`\nDependency previews written to ${cookedPath}`)
