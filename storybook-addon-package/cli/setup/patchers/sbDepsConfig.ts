import { existsSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { SbDepsConfig } from '../../../src/config.js'
import type { TsxFramework } from '../detect.js'

/**
 * The config filenames a project may already have. Matches the list `sb-deps.ts`
 * loads from, so we never write a file the runtime would ignore and never stomp
 * on one it would pick up.
 */
const CONFIG_FILE_CANDIDATES = [
	'sb-deps.config.js',
	'sb-deps.config.mjs',
	'sb-deps.config.cjs',
] as const

/** One of the config filenames above. */
type ConfigFileName = (typeof CONFIG_FILE_CANDIDATES)[number]

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
	/**
	 * Nothing was written and there is nothing to tell the user — either every
	 * value was already the default, or the only non-default one is a value they
	 * could not usefully add by hand (see `canUserAddByHand` below). The callers
	 * deliberately print nothing for this, which is why it carries no reason.
	 */
	| { kind: 'skipped' }
	| {
			/**
			 * A config file is already there, so nothing was written — and at least
			 * one value that was lost is one the user can put back. Separate from
			 * `skipped` because the two need opposite treatment: `skipped` has
			 * nothing to say, while this one means the wizard worked something out
			 * (often a source folder the user typed at the prompt) and could not
			 * record it, so the user has to be told or the value is silently lost.
			 */
			kind: 'blocked'
			/** The existing file's name, so the message can name what to edit. */
			existingFileName: ConfigFileName
			/**
			 * Summaries of the unwritten fields the user can usefully add by hand —
			 * not every unwritten field. See `canUserAddByHand`.
			 */
			fields: ReadonlyArray<string>
	  }
	| {
			/** The file could not be written. */
			kind: 'failed'
			reason: string
			/**
			 * The same list `blocked` carries, for the same reason: a failed write
			 * loses values too, and the user can only put back the ones worth
			 * putting back. Empty when nothing lost was worth naming.
			 */
			fields: ReadonlyArray<string>
	  }

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
	 * scaffolder outright which framework's `.tsx` templates to emit. It is not
	 * a rescue for a project the scaffolder cannot recognise: a `.tsx` file in
	 * one of those is turned away before any template is chosen, so the key only
	 * ever settles which templates a *recognised* project gets.
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
}

/**
 * Write a project-root `sb-deps.config.{js,cjs}` carrying the resolved `srcDir`,
 * the `tsxFramework` scaffolder signal, and/or a non-default
 * `storybookFileExtension`. Reports `skipped` when there's nothing worth
 * persisting — i.e. `srcDir === 'src'` (bundled default) AND `tsxFramework` is
 * the default `'react'` AND `storybookFileExtension` is the default
 * `'stories'`.
 *
 * Reports `blocked` when one of the candidate config filenames already exists
 * (the loader at `sb-deps.ts` accepts `.js`, `.mjs`, and `.cjs`; we never
 * overwrite a user's existing config without their say-so) *and* there was
 * something to write. That is deliberately not the same answer as `skipped`:
 * the wizard may have just asked the user for a source folder, and a blocked
 * write means the value they typed reaches the preview file but never reaches
 * the dependency scan — so the caller has to say so rather than finish quietly.
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
	} = opts

	const needsSrcDir = srcDir !== 'src'
	const needsTsxFramework = tsxFramework !== 'react'
	const needsStorybookFileExtension = storybookFileExtension === 'story'
	const hasNothingWorthWriting =
		!needsSrcDir && !needsTsxFramework && !needsStorybookFileExtension
	if (hasNothingWorthWriting) return { kind: 'skipped' }

	// Collect each non-default field once as both its file line and a
	// human-readable summary, so the written file and the caller's log share a
	// single source of truth for "which fields differ from the defaults":
	// `srcDir` when it's non-default, `tsxFramework` for a Solid or Preact
	// project (so the scaffolder picks that framework's templates for `.tsx`
	// files), and `storybookFileExtension: 'story'` for a non-default story
	// extension. Adding a field later updates both outputs from this one list.
	// Built before the existing-file check below so a blocked write can say
	// which values went unrecorded, not merely that one was blocked.
	//
	// `canUserAddByHand` says whether telling the user to put the field in an
	// existing config by hand would change anything. It would for `srcDir`
	// (nothing else records it, so the dependency scan stays pointed at the
	// wrong folder) and for `storybookFileExtension` (read only from the config,
	// with no detection fallback). It would not for `tsxFramework`: where the
	// scaffolder recognises the project it already falls back to the same value
	// the wizard computed, and where it does not, no `.tsx` file is scaffolded at
	// all — so asking for the key would send the user after something that cannot
	// help either way. The field is still written when the file is writable,
	// where it costs nothing and records the intent.
	const fields: Array<{
		line: string
		summary: string
		canUserAddByHand: boolean
	}> = []
	if (needsSrcDir) {
		const srcDirLiteral = `'${srcDir.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
		fields.push({
			line: `\tsrcDir: ${srcDirLiteral},`,
			summary: `srcDir: ${srcDirLiteral}`,
			canUserAddByHand: true,
		})
	}
	if (needsTsxFramework) {
		fields.push({
			line: `\ttsxFramework: '${tsxFramework}',`,
			summary: `tsxFramework: '${tsxFramework}'`,
			canUserAddByHand: false,
		})
	}
	if (needsStorybookFileExtension) {
		fields.push({
			line: `\tstorybookFileExtension: 'story',`,
			summary: `storybookFileExtension: 'story'`,
			canUserAddByHand: true,
		})
	}
	const fieldsToNameInTheMessage = fields
		.filter((f) => f.canUserAddByHand)
		.map((f) => f.summary)

	for (const name of CONFIG_FILE_CANDIDATES) {
		if (existsSync(resolve(cwd, name))) {
			// Nothing the user can act on, so nothing to say — same answer as a
			// write that was never needed.
			if (fieldsToNameInTheMessage.length === 0) return { kind: 'skipped' }
			return {
				kind: 'blocked',
				existingFileName: name,
				fields: fieldsToNameInTheMessage,
			}
		}
	}

	const ext = isEsm ? 'js' : 'cjs'
	const path = resolve(cwd, `sb-deps.config.${ext}`)
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
			fields: fieldsToNameInTheMessage,
		}
	}
	return { kind: 'created', path, fields: fields.map((f) => f.summary) }
}
