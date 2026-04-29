import { readFileSync, writeFileSync } from 'node:fs'

import type { MainFile } from '../detect.js'
import {
	detectEol,
	detectFileIndent,
	detectQuoteStyle,
	findMatchingBrace,
	findTopLevelKey,
	stripCommentsRespectingStrings,
} from '../util.js'

const ADDON_PATH = 'storybook-addon-dependency-previews/addon'
const ADDON_PRESENT = /['"]storybook-addon-dependency-previews\/addon['"]/

export type PatchResult =
	| { kind: 'skipped'; reason: string }
	| { kind: 'patched'; appliedTo: 'existing-array' | 'new-array' }
	| { kind: 'failed'; reason: string }

/**
 * Match the opening brace of the Storybook config object. `satisfies` style
 * (`const config = { ... } satisfies StorybookConfig`) places the type AFTER
 * the object so we match the `const <name> = {` form generically as a fallback.
 */
const CONFIG_OBJECT_OPENERS: ReadonlyArray<RegExp> = [
	/(:\s*StorybookConfig\s*=\s*\{)/,
	/(export\s+default\s*\{)/,
	/(module\.exports\s*=\s*\{)/,
	/(\bconst\s+\w+\s*=\s*\{)/,
]

/**
 * Locate the body of the Storybook config object: the range between its
 * opening `{` and matching `}`. Used to scope key lookups so they can't be
 * fooled by an unrelated object earlier in the file with the same key name.
 *
 * The opener regex runs against the comment-stripped content (which preserves
 * positions, so `match.index` lines up with the original) — that way an
 * `// export default {` example sitting in a comment can't be mistaken for
 * the real config's opener.
 */
function findConfigBodyRange(
	content: string,
): { bodyStart: number; bodyEnd: number } | null {
	const codeOnly = stripCommentsRespectingStrings(content)
	for (const opener of CONFIG_OBJECT_OPENERS) {
		const m = codeOnly.match(opener)
		if (!m || m.index === undefined) continue
		const openBraceIdx = m.index + m[0].length - 1
		if (content[openBraceIdx] !== '{') continue
		const closeBraceIdx = findMatchingBrace(content, openBraceIdx)
		if (closeBraceIdx === null) continue
		return { bodyStart: openBraceIdx + 1, bodyEnd: closeBraceIdx }
	}
	return null
}

function findAddonsArray(
	content: string,
	scope: { from: number; to: number },
): {
	openerStart: number
	arrayOpenIndex: number
	arrayCloseIndex: number
} | null {
	const key = findTopLevelKey(content, 'addons', scope)
	if (!key || content[key.valueStart] !== '[') return null
	const closeIndex = findMatchingBrace(content, key.valueStart)
	if (closeIndex === null) return null
	return {
		openerStart: key.keyStart,
		arrayOpenIndex: key.valueStart,
		arrayCloseIndex: closeIndex,
	}
}

function detectIndentInsideArray(
	arrayBody: string,
	content: string,
	arrayStart: number,
): string {
	for (const line of arrayBody.split(/\r?\n/)) {
		const m = line.match(/^([ \t]+)\S/)
		if (m) return m[1]!
	}
	// Empty array — items belong one indent unit deeper than the `addons:` line.
	// Using `detectFileIndent` for the unit instead of doubling the current
	// indent so that a deeply-nested `addons:` (e.g. inside a function) doesn't
	// over-indent the inserted entries.
	const lineStart = content.lastIndexOf('\n', arrayStart - 1) + 1
	const lineIndent = content.slice(lineStart, arrayStart).match(/^[ \t]*/)![0]
	const indentUnit = detectFileIndent(content)
	if (lineIndent.includes('\t')) return lineIndent + '\t'
	if (indentUnit.length > 0) return lineIndent + indentUnit
	return indentUnit
}

export function patchMainFile(mainFile: MainFile): PatchResult {
	let content: string
	try {
		content = readFileSync(mainFile.path, 'utf8')
	} catch (e) {
		return {
			kind: 'failed',
			reason: `Could not read ${mainFile.path}: ${(e as Error).message}`,
		}
	}

	// Strip comments (preserving string literals) before the "already registered"
	// check, otherwise a commented-out example like `// 'storybook-addon-dependency-previews/addon'`
	// would skip patching even when the addon isn't actually configured.
	if (ADDON_PRESENT.test(stripCommentsRespectingStrings(content))) {
		return { kind: 'skipped', reason: 'addon already registered' }
	}

	const bodyRange = findConfigBodyRange(content)
	if (!bodyRange) {
		return {
			kind: 'failed',
			reason:
				'Could not locate the Storybook config object in main file. The addon needs to be registered manually.',
		}
	}
	const scope = { from: bodyRange.bodyStart, to: bodyRange.bodyEnd }

	const arrayLoc = findAddonsArray(content, scope)
	if (!arrayLoc) {
		const keyLoc = findTopLevelKey(content, 'addons', scope)
		if (keyLoc && content[keyLoc.valueStart] !== '[') {
			return {
				kind: 'failed',
				reason:
					'Found an `addons:` key in main.ts but it is not a literal array (it may be a variable, spread, or function call). Add `\'storybook-addon-dependency-previews/addon\'` to your addons manually.',
			}
		}
	}

	const eol = detectEol(content)
	const quote = detectQuoteStyle(content)
	const ADDON_ENTRY = `${quote}${ADDON_PATH}${quote}`

	if (arrayLoc) {
		const body = content.slice(
			arrayLoc.arrayOpenIndex + 1,
			arrayLoc.arrayCloseIndex,
		)
		const indent = detectIndentInsideArray(body, content, arrayLoc.openerStart)
		// Preserve the indentation that came right before the closing `]`, so a
		// multi-line array keeps its `]` aligned with the opening `addons:` line.
		const closeLineStart =
			content.lastIndexOf('\n', arrayLoc.arrayCloseIndex - 1) + 1
		const closeIndent = content
			.slice(closeLineStart, arrayLoc.arrayCloseIndex)
			.match(/^[ \t]*/)![0]
		const trimmed = body.replace(/\s*$/, '')
		const newBody =
			trimmed.length === 0
				? `${eol}${indent}${ADDON_ENTRY},${eol}${closeIndent}`
				: `${trimmed}${trimmed.endsWith(',') ? '' : ','}${eol}${indent}${ADDON_ENTRY},${eol}${closeIndent}`
		const before = content.slice(0, arrayLoc.arrayOpenIndex + 1)
		const after = content.slice(arrayLoc.arrayCloseIndex)
		const newContent = before + newBody + after
		try {
			writeFileSync(mainFile.path, newContent, 'utf8')
		} catch (e) {
			return {
				kind: 'failed',
				reason: `Could not write ${mainFile.path}: ${(e as Error).message}`,
			}
		}
		return { kind: 'patched', appliedTo: 'existing-array' }
	}

	// No `addons:` key in the config body — insert one right after the opening `{`.
	const indent = detectFileIndent(content)
	const insertion = `${eol}${indent}addons: [${ADDON_ENTRY}],`
	const newContent =
		content.slice(0, bodyRange.bodyStart) +
		insertion +
		content.slice(bodyRange.bodyStart)
	try {
		writeFileSync(mainFile.path, newContent, 'utf8')
	} catch (e) {
		return {
			kind: 'failed',
			reason: `Could not write ${mainFile.path}: ${(e as Error).message}`,
		}
	}
	return { kind: 'patched', appliedTo: 'new-array' }
}
