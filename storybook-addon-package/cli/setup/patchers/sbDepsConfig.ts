import { existsSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

export type SbDepsConfigPatchResult =
	| { kind: 'created'; path: string }
	| { kind: 'skipped'; reason: string }
	| { kind: 'failed'; reason: string }

export interface WriteSbDepsConfigOptions {
	cwd: string
	/**
	 * Resolved source-folder name. The patcher is a no-op for the bundled
	 * default `'src'` — only non-default values (including the empty-string
	 * project-root sentinel) result in a file being written.
	 */
	srcDir: string
	/**
	 * Whether the project is ESM (`"type": "module"` in package.json). Picks
	 * the file extension and module syntax of the generated config.
	 */
	isEsm: boolean
}

/**
 * Write a project-root `sb-deps.config.{js,cjs}` containing the resolved
 * `srcDir`. No-op when `srcDir === 'src'` (bundled default — config file is
 * unnecessary) or when any of the candidate config filenames already exist
 * (the loader at `sb-deps.ts` accepts `.js`, `.mjs`, and `.cjs`; we never
 * overwrite a user's existing config without their say-so).
 */
export function writeSbDepsConfigIfNeeded(
	opts: WriteSbDepsConfigOptions,
): SbDepsConfigPatchResult {
	const { cwd, srcDir, isEsm } = opts

	if (srcDir === 'src') {
		return { kind: 'skipped', reason: 'srcDir is the default (src) — no config file needed' }
	}

	// Match the candidate list `sb-deps.ts` already loads from, so we don't
	// stomp on a file the runtime would otherwise pick up.
	const candidates = ['sb-deps.config.js', 'sb-deps.config.mjs', 'sb-deps.config.cjs']
	for (const name of candidates) {
		if (existsSync(resolve(cwd, name))) {
			return { kind: 'skipped', reason: `${name} already exists` }
		}
	}

	const ext = isEsm ? 'js' : 'cjs'
	const path = resolve(cwd, `sb-deps.config.${ext}`)
	const srcDirLiteral = `'${srcDir.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
	const content = isEsm
		? `import { defineSbDepsConfig } from 'storybook-addon-dependency-previews/config'

export default defineSbDepsConfig({
\tsrcDir: ${srcDirLiteral},
})
`
		: `const { defineSbDepsConfig } = require('storybook-addon-dependency-previews/config')

module.exports = defineSbDepsConfig({
\tsrcDir: ${srcDirLiteral},
})
`

	try {
		writeFileSync(path, content, 'utf8')
	} catch (e) {
		return {
			kind: 'failed',
			reason: `Could not write ${path}: ${(e as Error).message}`,
		}
	}
	return { kind: 'created', path }
}
