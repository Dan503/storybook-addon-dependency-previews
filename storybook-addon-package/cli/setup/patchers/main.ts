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

/**
 * Addons our `/addon` preset auto-registers (see `src/addon/index.ts`). Plain-string
 * entries for these in the consumer's `addons:` array are removed during patching to
 * avoid duplicate registration, which causes Storybook to bundle two copies of the
 * docs preview-annotation module into the iframe and throw
 * `Uncaught SyntaxError: redeclaration of const preview_<hash>`.
 */
const AUTO_REGISTERED_ADDONS: ReadonlyArray<string> = [
	'@storybook/addon-docs',
	'@storybook/addon-links',
]

export type PatchResult =
	| {
			kind: 'skipped'
			reason: string
			/** Notes the wizard caller should surface to the user (e.g. object-form duplicates). */
			warnings?: ReadonlyArray<string>
	  }
	| {
			kind: 'patched'
			appliedTo: 'existing-array' | 'new-array'
			/**
			 * Whether `'storybook-addon-dependency-previews/addon'` was actually
			 * inserted this run. False when the only thing the patcher did was
			 * remove redundant `@storybook/addon-docs` / `@storybook/addon-links`
			 * entries (our addon was already registered).
			 */
			addedAddon: boolean
			/** Plain-string entries removed because the `/addon` preset auto-registers them. */
			removedAddons?: ReadonlyArray<string>
			/** Notes the wizard caller should surface to the user (e.g. object-form duplicates). */
			warnings?: ReadonlyArray<string>
	  }
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

type AddonEntry =
	| { kind: 'string'; start: number; end: number; value: string }
	| { kind: 'object'; start: number; end: number; name: string | null }
	| { kind: 'other'; start: number; end: number }

/**
 * Walk the body of an `addons: [ ... ]` array and return one descriptor per
 * top-level entry. `start`/`end` are absolute indices into `content` and
 * span the entry's own characters only — not its trailing comma or
 * surrounding whitespace.
 *
 * Strings, template literals, comments, and nested `{}`/`[]`/`()` groups are
 * all respected, so a comma inside a nested object literal does not split
 * its parent entry.
 */
function tokenizeAddonEntries(
	content: string,
	arrayOpenIndex: number,
	arrayCloseIndex: number,
): Array<AddonEntry> {
	const entries: Array<AddonEntry> = []
	let depth = 0
	let inSQ = false
	let inDQ = false
	let inTL = false
	let inLC = false
	let inBC = false
	let entryStart: number | null = null

	const flush = (endExclusive: number) => {
		if (entryStart === null) return
		// Trim leading and trailing whitespace from the entry range.
		let s = entryStart
		let e = endExclusive
		while (s < e && /\s/.test(content[s]!)) s++
		while (e > s && /\s/.test(content[e - 1]!)) e--
		if (s >= e) {
			entryStart = null
			return
		}
		entries.push(classifyEntry(content, s, e))
		entryStart = null
	}

	let i = arrayOpenIndex + 1
	while (i < arrayCloseIndex) {
		const c = content[i]!
		const next = content[i + 1]

		if (inLC) {
			if (c === '\n') inLC = false
			i++
			continue
		}
		if (inBC) {
			if (c === '*' && next === '/') {
				inBC = false
				i += 2
				continue
			}
			i++
			continue
		}
		if (inSQ) {
			if (c === '\\') {
				i += 2
				continue
			}
			if (c === "'") inSQ = false
			i++
			continue
		}
		if (inDQ) {
			if (c === '\\') {
				i += 2
				continue
			}
			if (c === '"') inDQ = false
			i++
			continue
		}
		if (inTL) {
			if (c === '\\') {
				i += 2
				continue
			}
			if (c === '`') inTL = false
			i++
			continue
		}
		if (c === '/' && next === '/') {
			inLC = true
			i += 2
			continue
		}
		if (c === '/' && next === '*') {
			inBC = true
			i += 2
			continue
		}
		if (c === "'") {
			if (depth === 0 && entryStart === null) entryStart = i
			inSQ = true
			i++
			continue
		}
		if (c === '"') {
			if (depth === 0 && entryStart === null) entryStart = i
			inDQ = true
			i++
			continue
		}
		if (c === '`') {
			if (depth === 0 && entryStart === null) entryStart = i
			inTL = true
			i++
			continue
		}

		if (depth === 0 && c === ',') {
			flush(i)
			i++
			continue
		}

		if (c === '{' || c === '[' || c === '(') {
			if (depth === 0 && entryStart === null) entryStart = i
			depth++
			i++
			continue
		}
		if (c === '}' || c === ']' || c === ')') {
			if (depth > 0) depth--
			i++
			continue
		}

		if (depth === 0 && entryStart === null && /\S/.test(c)) {
			entryStart = i
		}
		i++
	}
	flush(arrayCloseIndex)
	return entries
}

function classifyEntry(
	content: string,
	start: number,
	end: number,
): AddonEntry {
	const text = content.slice(start, end)
	const stringMatch = text.match(/^(['"])((?:\\.|(?!\1).)*)\1$/)
	if (stringMatch) {
		return { kind: 'string', start, end, value: stringMatch[2]! }
	}
	if (text.startsWith('{') && text.endsWith('}')) {
		const nameMatch = text.match(/\bname\s*:\s*(['"])([^'"]+)\1/)
		return { kind: 'object', start, end, name: nameMatch?.[2] ?? null }
	}
	return { kind: 'other', start, end }
}

/**
 * Compute the slice range to delete when removing an entry. If the entry sits
 * alone on its own line (only leading/trailing whitespace plus its trailing
 * comma), the entire line including its newline is removed so we don't leave
 * a blank line. Otherwise just the entry plus its trailing comma and the
 * single space that typically follows is removed.
 */
function computeRemovalRange(
	content: string,
	entry: AddonEntry,
): { start: number; end: number } {
	let end = entry.end
	let j = end
	while (j < content.length && /[ \t]/.test(content[j]!)) j++
	if (content[j] === ',') {
		end = j + 1
	}

	const lineStart = content.lastIndexOf('\n', entry.start - 1) + 1
	const newlineAfter = content.indexOf('\n', end)
	const lineEnd = newlineAfter === -1 ? content.length : newlineAfter
	const beforeOnLine = content.slice(lineStart, entry.start)
	const afterOnLine = content.slice(end, lineEnd)
	if (/^\s*$/.test(beforeOnLine) && /^\s*$/.test(afterOnLine)) {
		const removeUpTo = newlineAfter === -1 ? content.length : newlineAfter + 1
		return { start: lineStart, end: removeUpTo }
	}

	while (end < content.length && content[end] === ' ') end++
	return { start: entry.start, end }
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
					"Found an `addons:` key in main.ts but it is not a literal array (it may be a variable, spread, or function call). Add `'storybook-addon-dependency-previews/addon'` to your addons manually.",
			}
		}
	}

	const eol = detectEol(content)
	const quote = detectQuoteStyle(content)
	const ADDON_ENTRY = `${quote}${ADDON_PATH}${quote}`

	if (arrayLoc) {
		const entries = tokenizeAddonEntries(
			content,
			arrayLoc.arrayOpenIndex,
			arrayLoc.arrayCloseIndex,
		)

		let ourAddonPresent = false
		const removedAddons: Array<string> = []
		const warnings: Array<string> = []
		const removalRanges: Array<{ start: number; end: number }> = []

		for (const entry of entries) {
			if (entry.kind === 'string') {
				if (entry.value === ADDON_PATH) {
					ourAddonPresent = true
					continue
				}
				if (AUTO_REGISTERED_ADDONS.includes(entry.value)) {
					removedAddons.push(entry.value)
					removalRanges.push(computeRemovalRange(content, entry))
				}
				continue
			}
			if (
				entry.kind === 'object' &&
				entry.name &&
				AUTO_REGISTERED_ADDONS.includes(entry.name)
			) {
				warnings.push(
					`Found object-form '${entry.name}' entry in your addons array. The /addon preset auto-registers '${entry.name}', so this duplicate may cause Storybook to bundle the docs annotation module twice ("Uncaught SyntaxError: redeclaration of const preview_<hash>" on the Docs tab). Left in place to preserve your options config — please review and either move the options elsewhere or remove the entry.`,
				)
			}
		}

		// Our addon counts as already registered if it's either a top-level string
		// entry inside the array (`ourAddonPresent`) or referenced elsewhere via a
		// spread / imported variable that the tokenizer can't see into
		// (`addonReferencedElsewhere`). Both cases must skip the append step —
		// otherwise we'd register our own addon twice and recreate the very class
		// of bug this patcher exists to prevent.
		const addonReferencedElsewhere =
			!ourAddonPresent &&
			ADDON_PRESENT.test(stripCommentsRespectingStrings(content))
		const addonAlreadyRegistered =
			ourAddonPresent || addonReferencedElsewhere

		// If there are no duplicate string entries to remove and our addon is
		// already registered, we have nothing to write. Object-form warnings are
		// still surfaced.
		if (removalRanges.length === 0 && addonAlreadyRegistered) {
			return {
				kind: 'skipped',
				reason: 'addon already registered',
				...(warnings.length > 0 ? { warnings } : {}),
			}
		}

		// Apply removals from highest start to lowest so earlier indices remain valid.
		let workingContent = content
		removalRanges.sort((a, b) => b.start - a.start)
		for (const r of removalRanges) {
			workingContent =
				workingContent.slice(0, r.start) + workingContent.slice(r.end)
		}

		// Re-locate the array on the post-removal content (its close index has shifted).
		const newBodyRange = findConfigBodyRange(workingContent)
		if (!newBodyRange) {
			return {
				kind: 'failed',
				reason:
					'Internal error: could not re-locate config body after removing duplicate addon entries.',
			}
		}
		const newArrayLoc = findAddonsArray(workingContent, {
			from: newBodyRange.bodyStart,
			to: newBodyRange.bodyEnd,
		})
		if (!newArrayLoc) {
			return {
				kind: 'failed',
				reason:
					'Internal error: could not re-locate addons array after removing duplicate entries.',
			}
		}

		if (addonAlreadyRegistered) {
			// Removals only — write what we have.
			try {
				writeFileSync(mainFile.path, workingContent, 'utf8')
			} catch (e) {
				return {
					kind: 'failed',
					reason: `Could not write ${mainFile.path}: ${(e as Error).message}`,
				}
			}
			return {
				kind: 'patched',
				appliedTo: 'existing-array',
				addedAddon: false,
				removedAddons,
				...(warnings.length > 0 ? { warnings } : {}),
			}
		}

		const body = workingContent.slice(
			newArrayLoc.arrayOpenIndex + 1,
			newArrayLoc.arrayCloseIndex,
		)
		const indent = detectIndentInsideArray(
			body,
			workingContent,
			newArrayLoc.openerStart,
		)
		// Preserve the indentation that came right before the closing `]`, so a
		// multi-line array keeps its `]` aligned with the opening `addons:` line.
		const closeLineStart =
			workingContent.lastIndexOf('\n', newArrayLoc.arrayCloseIndex - 1) + 1
		const closeIndent = workingContent
			.slice(closeLineStart, newArrayLoc.arrayCloseIndex)
			.match(/^[ \t]*/)![0]
		const trimmed = body.replace(/\s*$/, '')
		const newBody =
			trimmed.length === 0
				? `${eol}${indent}${ADDON_ENTRY},${eol}${closeIndent}`
				: `${trimmed}${trimmed.endsWith(',') ? '' : ','}${eol}${indent}${ADDON_ENTRY},${eol}${closeIndent}`
		const before = workingContent.slice(0, newArrayLoc.arrayOpenIndex + 1)
		const after = workingContent.slice(newArrayLoc.arrayCloseIndex)
		const newContent = before + newBody + after
		try {
			writeFileSync(mainFile.path, newContent, 'utf8')
		} catch (e) {
			return {
				kind: 'failed',
				reason: `Could not write ${mainFile.path}: ${(e as Error).message}`,
			}
		}
		return {
			kind: 'patched',
			appliedTo: 'existing-array',
			addedAddon: true,
			...(removedAddons.length > 0 ? { removedAddons } : {}),
			...(warnings.length > 0 ? { warnings } : {}),
		}
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
	return { kind: 'patched', appliedTo: 'new-array', addedAddon: true }
}
