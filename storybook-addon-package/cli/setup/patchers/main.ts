import { readFileSync, writeFileSync } from 'node:fs'

import type { MainFile } from '../detect.js'

const ADDON_PATH = 'storybook-addon-dependency-previews/addon'
const ADDON_PRESENT = /['"]storybook-addon-dependency-previews\/addon['"]/

export type PatchResult =
	| { kind: 'skipped'; reason: string }
	| { kind: 'patched'; appliedTo: 'existing-array' | 'new-array' }
	| { kind: 'failed'; reason: string }

// Match the opening brace of the Storybook config object. `satisfies` style
// (`const config = { ... } satisfies StorybookConfig`) places the type AFTER
// the object so we match the `const <name> = {` form generically as a fallback.
const CONFIG_OBJECT_OPENERS: ReadonlyArray<RegExp> = [
	/(:\s*StorybookConfig\s*=\s*\{)/,
	/(export\s+default\s*\{)/,
	/(module\.exports\s*=\s*\{)/,
	/(\bconst\s+\w+\s*=\s*\{)/,
]

// Locate a top-level `addons:` key using a state-aware scan that ignores
// `addons` occurrences inside strings, template literals, and comments
// (e.g. a `// addons: ['foo']` example in a comment must not be matched).
function findAddonsKey(
	content: string,
): { keyStart: number; valueStart: number } | null {
	let inSQ = false
	let inDQ = false
	let inTL = false
	let inLC = false
	let inBC = false

	let i = 0
	while (i < content.length) {
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
			inSQ = true
			i++
			continue
		}
		if (c === '"') {
			inDQ = true
			i++
			continue
		}
		if (c === '`') {
			inTL = true
			i++
			continue
		}

		// Match `addons` as a whole identifier followed by `:`
		if (
			content.startsWith('addons', i) &&
			(i === 0 || !/[A-Za-z0-9_$]/.test(content[i - 1]!)) &&
			!/[A-Za-z0-9_$]/.test(content[i + 6] ?? '')
		) {
			let j = i + 6
			while (j < content.length && /\s/.test(content[j]!)) j++
			if (content[j] === ':') {
				j++
				while (j < content.length && /\s/.test(content[j]!)) j++
				return { keyStart: i, valueStart: j }
			}
		}
		i++
	}
	return null
}

function findAddonsArray(content: string): {
	openerStart: number
	arrayOpenIndex: number
	arrayCloseIndex: number
} | null {
	const key = findAddonsKey(content)
	if (!key || content[key.valueStart] !== '[') return null
	const closeIndex = findMatchingBracket(content, key.valueStart)
	if (closeIndex === null) return null
	return {
		openerStart: key.keyStart,
		arrayOpenIndex: key.valueStart,
		arrayCloseIndex: closeIndex,
	}
}

function findMatchingBracket(content: string, openIdx: number): number | null {
	let depth = 0
	let inSQ = false
	let inDQ = false
	let inTL = false
	let inLC = false
	let inBC = false

	let i = openIdx
	while (i < content.length) {
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
			inSQ = true
			i++
			continue
		}
		if (c === '"') {
			inDQ = true
			i++
			continue
		}
		if (c === '`') {
			inTL = true
			i++
			continue
		}

		if (c === '[') {
			depth++
		} else if (c === ']') {
			depth--
			if (depth === 0) return i
		}
		i++
	}
	return null
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
	// Empty array — derive from the indent of the line containing `addons:`,
	// then add one more level (using the project's existing indent style).
	const lineStart = content.lastIndexOf('\n', arrayStart - 1) + 1
	const lineIndent = content.slice(lineStart, arrayStart).match(/^[ \t]*/)![0]
	if (lineIndent.includes('\t')) return lineIndent + '\t'
	if (lineIndent.length > 0) return lineIndent + ' '.repeat(lineIndent.length)
	return detectFileIndent(content)
}

function detectFileIndent(content: string): string {
	const m = content.match(/^([ \t]+)\S/m)
	return m ? m[1]! : '\t'
}

function detectEol(content: string): string {
	return content.includes('\r\n') ? '\r\n' : '\n'
}

function detectQuoteStyle(content: string): "'" | '"' {
	const m = content.match(/import[\s\S]+?from\s+(['"])/)
	return m ? (m[1] as "'" | '"') : "'"
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

	if (ADDON_PRESENT.test(content)) {
		return { kind: 'skipped', reason: 'addon already registered' }
	}

	const arrayLoc = findAddonsArray(content)
	if (!arrayLoc) {
		// Use the same state-aware scan as `findAddonsArray` so a `// addons: [...]`
		// example sitting in a comment doesn't trigger this error.
		const keyLoc = findAddonsKey(content)
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

	for (const opener of CONFIG_OBJECT_OPENERS) {
		const m = content.match(opener)
		if (!m || m.index === undefined) continue
		const indent = detectFileIndent(content)
		const insertion = `${eol}${indent}addons: [${ADDON_ENTRY}],`
		const insertAt = m.index + m[0].length
		const newContent =
			content.slice(0, insertAt) + insertion + content.slice(insertAt)
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

	return {
		kind: 'failed',
		reason:
			'Could not locate the Storybook config object in main file. The addon needs to be registered manually.',
	}
}
