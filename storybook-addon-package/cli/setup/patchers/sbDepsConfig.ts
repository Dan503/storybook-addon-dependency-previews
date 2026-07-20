import { existsSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { SbDepsConfig } from '../../../src/config.js'

export type SbDepsConfigPatchResult =
	| {
			kind: 'created'
			path: string
			/**
			 * Human-readable summaries of the non-default fields actually written
			 * (e.g. `["srcDir: 'app'", "storybookFileExtension: 'story'"]`). The
			 * caller logs these verbatim, so "which fields were written" has a
			 * single source of truth here rather than being re-derived at the log
			 * site.
			 */
			fields: ReadonlyArray<string>
	  }
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
	/**
	 * Preferred story-file extension the scaffolder should use — `'stories'`
	 * (Storybook's convention, the default) or `'story'`. Only a non-default
	 * `'story'` triggers a config write on its own.
	 * @default 'stories'
	 */
	storybookFileExtension?: NonNullable<SbDepsConfig['storybookFileExtension']>
}

/**
 * Write a project-root `sb-deps.config.{js,cjs}` carrying the resolved `srcDir`
 * and/or a non-default `storybookFileExtension`. No-op when there's nothing
 * worth persisting — i.e. `srcDir === 'src'` (bundled default) AND
 * `storybookFileExtension` is the default `'stories'` — or when any of the
 * candidate config filenames already exist (the loader at `sb-deps.ts` accepts
 * `.js`, `.mjs`, and `.cjs`; we never overwrite a user's existing config
 * without their say-so).
 */
export function writeSbDepsConfigIfNeeded(
	opts: WriteSbDepsConfigOptions,
): SbDepsConfigPatchResult {
	const { cwd, srcDir, isEsm, storybookFileExtension = 'stories' } = opts

	const needsSrcDir = srcDir !== 'src'
	const needsStorybookFileExtension = storybookFileExtension === 'story'
	if (!needsSrcDir && !needsStorybookFileExtension) {
		return {
			kind: 'skipped',
			reason:
				'srcDir is the default (src) and storybookFileExtension is the default (stories) — no config file needed',
		}
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

	// Collect each non-default field once as both its file line and a
	// human-readable summary, so the written file and the caller's success log
	// share a single source of truth for "which fields differ from the
	// defaults". Adding a field later updates both outputs from this one list.
	const fields: Array<{ line: string; summary: string }> = []
	if (needsSrcDir) {
		const srcDirLiteral = `'${srcDir.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
		fields.push({
			line: `\tsrcDir: ${srcDirLiteral},`,
			summary: `srcDir: ${srcDirLiteral}`,
		})
	}
	if (needsStorybookFileExtension) {
		fields.push({
			line: `\tstorybookFileExtension: 'story',`,
			summary: `storybookFileExtension: 'story'`,
		})
	}
	const configBody = fields.map((f) => f.line).join('\n')

	const content = isEsm
		? `import { defineSbDepsConfig } from 'storybook-addon-dependency-previews/config'

export default defineSbDepsConfig({
${configBody}
})
`
		: `const { defineSbDepsConfig } = require('storybook-addon-dependency-previews/config')

module.exports = defineSbDepsConfig({
${configBody}
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
	return { kind: 'created', path, fields: fields.map((f) => f.summary) }
}
