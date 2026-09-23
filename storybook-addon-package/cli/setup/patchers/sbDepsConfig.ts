import { existsSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { SbDepsConfig } from '../../../src/config.js'
import type { TsxFramework } from '../detect.js'

export type SbDepsConfigPatchResult =
	| {
			kind: 'created'
			path: string
			/**
			 * Human-readable summaries of the non-default fields actually written
			 * (e.g. `["srcDir: 'app'", "tsxFramework: 'solid'",
			 * "storybookFileExtension: 'story'"]`). The caller logs these verbatim,
			 * so "which fields were written" has a single source of truth here
			 * rather than being re-derived at the log site.
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
	 * `tsxFramework` is non-default (see below).
	 */
	srcDir: string
	/**
	 * Whether the project is ESM (`"type": "module"` in package.json). Picks
	 * the file extension and module syntax of the generated config.
	 */
	isEsm: boolean
	/**
	 * Which templates the project's `.tsx` files should be scaffolded from.
	 * Anything other than `'react'` gets the config written even for the default
	 * `srcDir`, so it can carry `tsxFramework`, which tells the `sb-deps`
	 * scaffolder outright which framework's `.tsx` templates to emit. The
	 * scaffolder works that out for itself as well, so the key is what settles
	 * it where that detection comes up empty.
	 * @default 'react'
	 */
	tsxFramework?: TsxFramework
	/**
	 * Preferred story-file extension the scaffolder should use — `'stories'`
	 * (Storybook's convention, the default) or `'story'`. Only a non-default
	 * `'story'` triggers a config write on its own.
	 * @default 'stories'
	 */
	storybookFileExtension?: NonNullable<SbDepsConfig['storybookFileExtension']>
	/**
	 * What marks a Lit component file, without its dot. Anything non-empty gets
	 * the config written even for the default `srcDir`, because the code's own
	 * default is no marker: without the key every plain `.ts` file under the
	 * source folder is treated as a component, which is the opposite of what
	 * setting one asks for. Left out for a project that isn't Lit.
	 */
	litComponentSuffix?: string
	/**
	 * The prefix put in front of a Lit component's tag. Only a non-default value
	 * triggers a config write. The wizard never asks for this — it is accepted so
	 * that everything the config file can carry can be written from one place.
	 * @default 'app-'
	 */
	litTagPrefix?: string
}

/**
 * Write a project-root `sb-deps.config.{js,cjs}` carrying the resolved `srcDir`,
 * the `tsxFramework` scaffolder signal, a non-default `storybookFileExtension`,
 * and/or a Lit project's component marker and tag prefix. No-op when there's
 * nothing worth persisting — i.e. `srcDir === 'src'` (bundled default) AND
 * `tsxFramework` is the default `'react'` AND `storybookFileExtension` is the
 * default `'stories'` AND no Lit marker or non-default tag prefix was asked
 * for — or when any of the candidate config filenames already exist (the loader at
 * `sb-deps.ts` accepts `.js`, `.mjs`, and `.cjs`; we never overwrite a user's
 * existing config without their say-so).
 */
export function writeSbDepsConfigIfNeeded(
	opts: WriteSbDepsConfigOptions,
): SbDepsConfigPatchResult {
	const {
		cwd,
		srcDir,
		isEsm,
		tsxFramework = 'react',
		storybookFileExtension = 'stories',
		litComponentSuffix,
		litTagPrefix,
	} = opts

	const needsSrcDir = srcDir !== 'src'
	const needsTsxFramework = tsxFramework !== 'react'
	const needsStorybookFileExtension = storybookFileExtension === 'story'
	// Any marker at all is worth writing, because the code's own default is none.
	const needsLitComponentSuffix = !!litComponentSuffix
	const needsLitTagPrefix =
		litTagPrefix !== undefined && litTagPrefix !== 'app-'
	const hasNothingWorthWriting =
		!needsSrcDir &&
		!needsTsxFramework &&
		!needsStorybookFileExtension &&
		!needsLitComponentSuffix &&
		!needsLitTagPrefix
	if (hasNothingWorthWriting) {
		return {
			kind: 'skipped',
			reason:
				'srcDir is the default (src), tsxFramework is the default (react), storybookFileExtension is the default (stories), and no Lit component marker or tag prefix was asked for — no config file needed',
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
	// defaults": `srcDir` when it's non-default, `tsxFramework` for a Solid or
	// Preact project (so the scaffolder picks that framework's templates for
	// `.tsx` files), and `storybookFileExtension: 'story'` for a non-default
	// story extension. Adding a field later updates both outputs from this one
	// list.
	const fields: Array<{ line: string; summary: string }> = []
	if (needsSrcDir) {
		const srcDirLiteral = toSingleQuotedLiteral(srcDir)
		fields.push({
			line: `\tsrcDir: ${srcDirLiteral},`,
			summary: `srcDir: ${srcDirLiteral}`,
		})
	}
	if (needsTsxFramework) {
		fields.push({
			line: `\ttsxFramework: '${tsxFramework}',`,
			summary: `tsxFramework: '${tsxFramework}'`,
		})
	}
	if (needsStorybookFileExtension) {
		fields.push({
			line: `\tstorybookFileExtension: 'story',`,
			summary: `storybookFileExtension: 'story'`,
		})
	}
	if (needsLitComponentSuffix) {
		const litComponentSuffixLiteral = toSingleQuotedLiteral(litComponentSuffix)
		fields.push({
			line: `\tlitComponentSuffix: ${litComponentSuffixLiteral},`,
			summary: `litComponentSuffix: ${litComponentSuffixLiteral}`,
		})
	}
	if (needsLitTagPrefix) {
		const litTagPrefixLiteral = toSingleQuotedLiteral(litTagPrefix)
		fields.push({
			line: `\tlitTagPrefix: ${litTagPrefixLiteral},`,
			summary: `litTagPrefix: ${litTagPrefixLiteral}`,
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

/**
 * A value as a single-quoted string the generated config file can hold, with
 * backslashes and single quotes escaped — a Windows `srcDir` carries the first
 * and a folder name can carry the second.
 */
function toSingleQuotedLiteral(value: string): string {
	return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}
