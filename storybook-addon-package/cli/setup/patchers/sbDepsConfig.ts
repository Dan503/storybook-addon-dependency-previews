import { existsSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

export type SbDepsConfigPatchResult =
	| {
			kind: 'created'
			path: string
			/**
			 * Human-readable summaries of the non-default fields actually written
			 * (e.g. `["srcDir: 'app'", "tsxFramework: 'solid'"]`). The caller logs
			 * these verbatim, so "which fields were written" has a single source of
			 * truth here rather than being re-derived at the log site.
			 */
			fields: ReadonlyArray<string>
	  }
	| { kind: 'skipped'; reason: string }
	| { kind: 'failed'; reason: string }

export interface WriteSbDepsConfigOptions {
	cwd: string
	/**
	 * Resolved source-folder name. On its own, a non-default value (anything
	 * other than the bundled `'src'`, including the empty-string project-root
	 * sentinel) triggers a config write; the default `'src'` does not — unless
	 * `isSolid` is set (see below).
	 */
	srcDir: string
	/**
	 * Whether the project is ESM (`"type": "module"` in package.json). Picks
	 * the file extension and module syntax of the generated config.
	 */
	isEsm: boolean
	/**
	 * Whether the project uses Solid. When true, the config is written even for
	 * the default `srcDir` so it can carry `tsxFramework: 'solid'` — the signal
	 * the `sb-deps` scaffolder needs to emit Solid (not React) templates for
	 * `.tsx` component/story files, which the two frameworks share.
	 */
	isSolid?: boolean
}

/**
 * Write a project-root `sb-deps.config.{js,cjs}` carrying the resolved
 * `srcDir` and/or the `tsxFramework` scaffolder signal. No-op when there's
 * nothing worth persisting — i.e. `srcDir === 'src'` (bundled default) AND the
 * project isn't Solid — or when any of the candidate config filenames already
 * exist (the loader at `sb-deps.ts` accepts `.js`, `.mjs`, and `.cjs`; we never
 * overwrite a user's existing config without their say-so).
 */
export function writeSbDepsConfigIfNeeded(
	opts: WriteSbDepsConfigOptions,
): SbDepsConfigPatchResult {
	const { cwd, srcDir, isEsm, isSolid = false } = opts

	const needsSrcDir = srcDir !== 'src'
	if (!needsSrcDir && !isSolid) {
		return {
			kind: 'skipped',
			reason: 'srcDir is the default (src) and project is not Solid — no config file needed',
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

	// Collect the non-default fields once, each as both its file line and a
	// human-readable summary, so the written file and the caller's success log
	// share a single source of truth for "which fields differ from the
	// defaults": `srcDir` when it's non-default, and `tsxFramework: 'solid'` for
	// Solid projects (so the scaffolder picks Solid templates for `.tsx` files).
	// Adding a third field later updates both outputs from this one list.
	const fields: Array<{ line: string; summary: string }> = []
	if (needsSrcDir) {
		const srcDirLiteral = `'${srcDir.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
		fields.push({
			line: `\tsrcDir: ${srcDirLiteral},`,
			summary: `srcDir: ${srcDirLiteral}`,
		})
	}
	if (isSolid) {
		fields.push({
			line: `\ttsxFramework: 'solid',`,
			summary: `tsxFramework: 'solid'`,
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
