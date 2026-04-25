import { readFileSync, writeFileSync } from 'node:fs'

import type { MainFile } from '../detect.js'

const ADDON_ENTRY = "'storybook-addon-dependency-previews/addon'"

export type PatchResult =
	| { kind: 'skipped'; reason: string }
	| { kind: 'patched'; appliedTo: 'existing-array' | 'new-array' }
	| { kind: 'failed'; reason: string }

const ADDONS_ARRAY_REGEX = /(addons\s*:\s*\[)([\s\S]*?)(\])/

const CONFIG_OBJECT_OPENERS: ReadonlyArray<RegExp> = [
	/(StorybookConfig\s*=\s*\{)/,
	/(satisfies\s+StorybookConfig\s*=\s*\{)/,
	/(:\s*StorybookConfig\s*=\s*\{)/,
	/(export\s+default\s*\{)/,
	/(module\.exports\s*=\s*\{)/,
]

function detectIndentInsideArray(arrayBody: string): string {
	const lines = arrayBody.split(/\r?\n/)
	for (const line of lines) {
		const m = line.match(/^([ \t]+)\S/)
		if (m) return m[1]!
	}
	return '\t'
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

	if (content.includes(ADDON_ENTRY)) {
		return { kind: 'skipped', reason: 'addon already registered' }
	}

	const arrayMatch = content.match(ADDONS_ARRAY_REGEX)
	if (arrayMatch) {
		const [full, openBracket, body, closeBracket] = arrayMatch
		const indent = detectIndentInsideArray(body)
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
