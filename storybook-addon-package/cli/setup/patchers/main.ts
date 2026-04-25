import { readFileSync, writeFileSync } from 'node:fs'

import type { MainFile } from '../detect.js'

const ADDON_PATH = 'storybook-addon-dependency-previews/addon'
const ADDON_ENTRY = `'${ADDON_PATH}'`
const ADDON_PRESENT = /['"]storybook-addon-dependency-previews\/addon['"]/

export type PatchResult =
	| { kind: 'skipped'; reason: string }
	| { kind: 'patched'; appliedTo: 'existing-array' | 'new-array' }
	| { kind: 'failed'; reason: string }

const ADDONS_ARRAY_REGEX = /(addons\s*:\s*\[)([\s\S]*?)(\])/

// Match the opening brace of the Storybook config object. `satisfies` style
// (`const config = { ... } satisfies StorybookConfig`) places the type AFTER
// the object so we match the `const <name> = {` form generically as a fallback.
const CONFIG_OBJECT_OPENERS: ReadonlyArray<RegExp> = [
	/(:\s*StorybookConfig\s*=\s*\{)/,
	/(export\s+default\s*\{)/,
	/(module\.exports\s*=\s*\{)/,
	/(\bconst\s+\w+\s*=\s*\{)/,
]

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

	const arrayMatch = content.match(ADDONS_ARRAY_REGEX)
	if (arrayMatch && arrayMatch.index !== undefined) {
		const [full, openBracket, body, closeBracket] = arrayMatch
		const indent = detectIndentInsideArray(body, content, arrayMatch.index)
		const trimmed = body.replace(/\s*$/, '')
		const newBody =
			trimmed.length === 0
				? `\n${indent}${ADDON_ENTRY},\n`
				: `${trimmed}${trimmed.endsWith(',') ? '' : ','}\n${indent}${ADDON_ENTRY},\n`
		const newContent = content.replace(
			full,
			`${openBracket}${newBody}${closeBracket}`,
		)
		writeFileSync(mainFile.path, newContent, 'utf8')
		return { kind: 'patched', appliedTo: 'existing-array' }
	}

	for (const opener of CONFIG_OBJECT_OPENERS) {
		const m = content.match(opener)
		if (!m || m.index === undefined) continue
		const indent = detectFileIndent(content)
		const insertion = `\n${indent}addons: [${ADDON_ENTRY}],`
		const insertAt = m.index + m[0].length
		const newContent =
			content.slice(0, insertAt) + insertion + content.slice(insertAt)
		writeFileSync(mainFile.path, newContent, 'utf8')
		return { kind: 'patched', appliedTo: 'new-array' }
	}

	return {
		kind: 'failed',
		reason:
			'Could not locate the Storybook config object in main file. The addon needs to be registered manually.',
	}
}
