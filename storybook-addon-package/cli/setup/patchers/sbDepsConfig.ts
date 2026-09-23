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
	| {
			kind: 'skipped'
			reason: string
			/**
			 * Which of the two skips this was, for callers that have to tell them
			 * apart.
			 *
			 * `'nothing-to-write'` means every value was the default, so the config
			 * this would have written is the one the code already behaves as if it
			 * had — nothing is unrecorded. `'config-exists'` means a file is there
			 * that this never read, so an answer the user gave may be contradicted
			 * by whatever it holds, and only they can tell.
			 *
			 * Matched on rather than the `reason` string, which is prose for a
			 * human and not a thing to branch on.
			 */
			cause: 'nothing-to-write' | 'config-exists'
	  }
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
	 * default is no marker: without the key any plain `.ts` file created empty
	 * under the source folder is treated as a component, which is the opposite
	 * of what setting one asks for. Left out for a project that isn't Lit.
	 */
	litComponentSuffix?: string
}

/**
 * Write a project-root `sb-deps.config.{js,cjs}` carrying the resolved `srcDir`,
 * the `tsxFramework` scaffolder signal, a non-default `storybookFileExtension`,
 * and/or a Lit project's component marker. No-op when there's nothing worth
 * persisting — i.e. `srcDir === 'src'` (bundled default) AND `tsxFramework` is
 * the default `'react'` AND `storybookFileExtension` is the default
 * `'stories'` AND no Lit marker was asked for — or when any of the candidate
 * config filenames already exist (the loader at `sb-deps.ts` accepts `.js`,
 * `.mjs`, and `.cjs`; we never overwrite a user's existing config without
 * their say-so).
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
	} = opts

	const needsSrcDir = srcDir !== 'src'
	const needsTsxFramework = tsxFramework !== 'react'
	const needsStorybookFileExtension = storybookFileExtension === 'story'
	// Any marker at all is worth writing, because the code's own default is none.
	const needsLitComponentSuffix = !!litComponentSuffix
	const hasNothingWorthWriting =
		!needsSrcDir &&
		!needsTsxFramework &&
		!needsStorybookFileExtension &&
		!needsLitComponentSuffix
	// Asked BEFORE `hasNothingWorthWriting`, even though either would end the
	// call, so that `cause` says which situation the project is actually in. A
	// caller checking whether an answer got recorded needs "a file is there
	// that I never read" to win over "I had nothing to write": the second reads
	// as *nothing is unrecorded*, which is only true when there is no file to
	// contradict it. Match the candidate list `sb-deps.ts` already loads from,
	// so we don't stomp on a file the runtime would otherwise pick up.
	const candidates = ['sb-deps.config.js', 'sb-deps.config.mjs', 'sb-deps.config.cjs']
	for (const name of candidates) {
		if (existsSync(resolve(cwd, name))) {
			return {
				kind: 'skipped',
				cause: 'config-exists',
				reason: `${name} already exists`,
			}
		}
	}

	if (hasNothingWorthWriting) {
		return {
			kind: 'skipped',
			cause: 'nothing-to-write',
			reason:
				'srcDir is the default (src), tsxFramework is the default (react), storybookFileExtension is the default (stories), and no Lit component marker was asked for — no config file needed',
		}
	}

	const ext = isEsm ? 'js' : 'cjs'
	const path = resolve(cwd, `sb-deps.config.${ext}`)

	// Collect each non-default field once as both its file line and a
	// human-readable summary, so the written file and the caller's success log
	// share a single source of truth for "which fields differ from the
	// defaults". The blocks below are that list — each one says which field it
	// is for and what makes it worth writing — so adding a field later means
	// adding a block, and both outputs follow.
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
