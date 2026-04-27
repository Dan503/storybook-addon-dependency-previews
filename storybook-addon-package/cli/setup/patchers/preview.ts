import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { Framework, PreviewFile } from '../detect.js'

export type PreviewPatchResult =
	| { kind: 'created'; path: string }
	| { kind: 'skipped'; reason: string }
	| { kind: 'patched'; path: string }
	| { kind: 'failed'; reason: string }

type SupportedFramework = 'react-vite' | 'sveltekit' | 'svelte-vite'

const STORY_GLOBS: Record<SupportedFramework, string> = {
	'react-vite': '/src/**/*.stories.@(tsx|ts|jsx|js)',
	sveltekit: '/src/**/*.stories.@(ts|js|svelte)',
	'svelte-vite': '/src/**/*.stories.@(ts|js|svelte)',
}

function dependencyPreviewsBlock(
	framework: SupportedFramework,
	sourceRootUrl: string,
	indent: string = '\t',
	eol: string = '\n',
	quote: "'" | '"' = "'",
): string {
	const l2 = indent.repeat(2)
	const l3 = indent.repeat(3)
	const l4 = indent.repeat(4)
	const lines = [
		`${l2}dependencyPreviews: {`,
		`${l3}dependenciesJson,`,
		`${l3}projectRootPath: new URL(${quote}..${quote}, import.meta.url).pathname,`,
		`${l3}storyModules: import.meta.glob(`,
		`${l4}${quote}${STORY_GLOBS[framework]}${quote},`,
		`${l4}{ eager: false },`,
		`${l3}),`,
	]
	if (sourceRootUrl) {
		// JSON.stringify always emits double quotes; convert when the file uses single
		// quotes so the inserted line matches surrounding style. URLs in practice contain
		// no characters that need re-escaping, but we still escape backslashes / single
		// quotes / line terminators for safety.
		const serialised =
			quote === '"'
				? JSON.stringify(sourceRootUrl)
				: `'${sourceRootUrl
						.replace(/\\/g, '\\\\')
						.replace(/'/g, "\\'")
						.replace(/\n/g, '\\n')
						.replace(/\r/g, '\\r')}'`
		lines.push(`${l3}sourceRootUrl: ${serialised},`)
	}
	lines.push(`${l2}},`)
	return lines.join(eol)
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

// Strip line and block comments while keeping string and template literals intact.
// Used for the idempotency / `module.exports` checks so that commented-out example
// code can't false-positive (or false-negative when a `//` happens to appear inside
// a string literal).
function stripCommentsRespectingStrings(content: string): string {
	let out = ''
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
			if (c === '\n') {
				inLC = false
				out += c
			}
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
			out += c
			if (c === '\\' && i + 1 < content.length) {
				out += content[i + 1]
				i += 2
				continue
			}
			if (c === "'") inSQ = false
			i++
			continue
		}
		if (inDQ) {
			out += c
			if (c === '\\' && i + 1 < content.length) {
				out += content[i + 1]
				i += 2
				continue
			}
			if (c === '"') inDQ = false
			i++
			continue
		}
		if (inTL) {
			out += c
			if (c === '\\' && i + 1 < content.length) {
				out += content[i + 1]
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
			out += c
			i++
			continue
		}
		if (c === '"') {
			inDQ = true
			out += c
			i++
			continue
		}
		if (c === '`') {
			inTL = true
			out += c
			i++
			continue
		}
		out += c
		i++
	}
	return out
}

function reactTemplate(sourceRootUrl: string): string {
	return `/// <reference types="vite/client" />

import {
\tdefaultPreviewParameters,
\tdependencyPreviewDecorators,
\ttype StorybookPreviewConfig,
} from 'storybook-addon-dependency-previews'

import dependenciesJson from './dependency-previews.json'

const previewConfig: StorybookPreviewConfig = {
\tparameters: {
\t\t...defaultPreviewParameters,
${dependencyPreviewsBlock('react-vite', sourceRootUrl)}
\t},
\tdecorators: [...dependencyPreviewDecorators],
}

export default previewConfig
`
}

function svelteTemplate(
	framework: 'sveltekit' | 'svelte-vite',
	sourceRootUrl: string,
): string {
	return `/// <reference types="vite/client" />

import {
\tdefaultPreviewParameters,
\tdependencyPreviewDecorators,
\ttype StorybookPreviewConfig,
} from 'storybook-addon-dependency-previews'

import dependenciesJson from './dependency-previews.json'

const previewConfig: StorybookPreviewConfig = {
\tparameters: {
\t\t...defaultPreviewParameters,
${dependencyPreviewsBlock(framework, sourceRootUrl)}
\t},
\tdecorators: [...dependencyPreviewDecorators],
}

export default previewConfig
`
}

function templateForFramework(
	framework: SupportedFramework,
	sourceRootUrl: string,
): { content: string; lang: PreviewFile['lang'] } {
	if (framework === 'react-vite') {
		return { content: reactTemplate(sourceRootUrl), lang: 'ts' }
	}
	return { content: svelteTemplate(framework, sourceRootUrl), lang: 'ts' }
}

function findImportInsertionIndex(content: string): number {
	const lines = content.split('\n')
	let idx = 0
	let inBlockComment = false

	for (let i = 0; i < lines.length; i++) {
		const rawLine = lines[i]!
		const trimmed = rawLine.trim()
		const advance = rawLine.length + 1 // +1 for the consumed '\n'

		if (inBlockComment) {
			idx += advance
			if (rawLine.includes('*/')) inBlockComment = false
			continue
		}

		if (
			trimmed === '' ||
			trimmed.startsWith('//') || // line comment & triple-slash directive
			trimmed.startsWith("'use client'") ||
			trimmed.startsWith('"use client"')
		) {
			idx += advance
			continue
		}

		if (trimmed.startsWith('/*')) {
			idx += advance
			// Multi-line block comment if no `*/` later on the same line.
			if (!trimmed.slice(2).includes('*/')) inBlockComment = true
			continue
		}

		break
	}
	return idx
}

function patchExistingPreview(
	previewFile: PreviewFile,
	framework: SupportedFramework,
	sourceRootUrl: string,
): PreviewPatchResult {
	let content: string
	try {
		content = readFileSync(previewFile.path, 'utf8')
	} catch (e) {
		return {
			kind: 'failed',
			reason: `Could not read ${previewFile.path}: ${(e as Error).message}`,
		}
	}

	// Strip comments before doing identifier checks so commented-out example code
	// can't false-positive the idempotency / CJS guards. (Strings and template
	// literals are left intact so a URL containing `//` doesn't get truncated.)
	const codeOnly = stripCommentsRespectingStrings(content)

	// Look for the addon's wired-in identifiers — not just any import of the package.
	// `dependencyPreviewDecorators` is a unique exported name, and `dependencyPreviews:`
	// is the unique parameters key. Either presence means the addon is already configured.
	if (/\bdependencyPreviewDecorators\b|\bdependencyPreviews\s*:/.test(codeOnly)) {
		return { kind: 'skipped', reason: 'addon already configured in preview' }
	}

	if (/\bmodule\.exports\s*=/.test(codeOnly)) {
		return {
			kind: 'failed',
			reason:
				'Preview file uses CommonJS (module.exports). The wizard only patches ESM preview files — please convert to ESM or follow the manual setup docs.',
		}
	}

	const isTs = previewFile.lang === 'ts' || previewFile.lang === 'tsx'
	const indent = detectFileIndent(content)
	const eol = detectEol(content)
	const quote = detectQuoteStyle(content)
	const l1 = indent
	const l2 = indent.repeat(2)

	let newContent = content

	// ─── Imports: extend an existing addon import if one is present, otherwise insert a new one ───
	const PKG = 'storybook-addon-dependency-previews'
	const existingAddonImport = newContent.match(
		/import\s*(type\s+)?\{([\s\S]*?)\}\s*from\s*['"]storybook-addon-dependency-previews['"]/,
	)
	const hasDependenciesJsonImport =
		/import\s+dependenciesJson\s+from\s*['"]\.\/dependency-previews\.json['"]/.test(
			newContent,
		)

	const requiredValueNames = [
		'defaultPreviewParameters',
		'dependencyPreviewDecorators',
	]
	const requiredTypeNames = isTs ? ['StorybookPreviewConfig'] : []

	if (existingAddonImport) {
		const wasTypeOnly = !!existingAddonImport[1]
		// Strip comments from the captured named-import list before splitting on commas.
		// Otherwise `import { foo, /* note */ bar }` ends up with `/* note */ bar` as one name
		// and the rebuilt import is invalid TypeScript.
		const importContents = existingAddonImport[2]!
			.replace(/\/\*[\s\S]*?\*\//g, '')
			.replace(/\/\/.*$/gm, '')
		const rawExistingNames = importContents
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)

		type Entry = { name: string; alias?: string; isType: boolean }
		const parseEntry = (raw: string): Entry => {
			// `import type { A, B }` makes every name a type, so respect that.
			const isType = wasTypeOnly || /^type\s+/.test(raw)
			const stripped = raw.replace(/^type\s+/, '')
			const [name, alias] = stripped
				.split(/\s+as\s+/)
				.map((s) => s.trim())
			return { name: name!, alias, isType }
		}
		const formatEntry = (e: Entry): string => {
			const inner = e.alias ? `${e.name} as ${e.alias}` : e.name
			return e.isType ? `type ${inner}` : inner
		}

		const existingEntries = rawExistingNames.map(parseEntry)
		const requiredValueSet = new Set(requiredValueNames)

		// Promote any existing entry whose name matches a required value to a value
		// import. This handles e.g. `import type { defaultPreviewParameters } from ...` —
		// without promotion we'd leave it as a type and the runtime spread would fail.
		const mergedEntries: Array<Entry> = existingEntries.map((e) =>
			requiredValueSet.has(e.name) && e.isType ? { ...e, isType: false } : e,
		)
		const handled = new Set(mergedEntries.map((e) => e.name))
		for (const n of requiredValueNames) {
			if (!handled.has(n)) {
				mergedEntries.push({ name: n, isType: false })
				handled.add(n)
			}
		}
		for (const n of requiredTypeNames) {
			if (!handled.has(n)) {
				mergedEntries.push({ name: n, isType: true })
				handled.add(n)
			}
		}

		const originallyValid = existingEntries.every(
			(e) => mergedEntries.find((m) => m.name === e.name)?.isType === e.isType,
		)
		const allRequiredAlreadyValueImported = requiredValueNames.every((n) =>
			existingEntries.some((e) => e.name === n && !e.isType),
		)
		const allRequiredAlreadyTypeImported = requiredTypeNames.every((n) =>
			existingEntries.some((e) => e.name === n && e.isType),
		)
		const nothingToDo =
			originallyValid &&
			allRequiredAlreadyValueImported &&
			allRequiredAlreadyTypeImported

		if (!nothingToDo) {
			const replacement = `import {${eol}${mergedEntries
				.map((e) => `${indent}${formatEntry(e)},`)
				.join(eol)}${eol}} from ${quote}${PKG}${quote}`
			newContent = newContent.replace(existingAddonImport[0], replacement)
		}
	}

	const importsToInsert: string[] = []
	if (!existingAddonImport) {
		const addonImportBlock = [
			`import {`,
			`${indent}defaultPreviewParameters,`,
			`${indent}dependencyPreviewDecorators,${isTs ? `${eol}${indent}type StorybookPreviewConfig,` : ''}`,
			`} from ${quote}${PKG}${quote}`,
		].join(eol)
		importsToInsert.push(addonImportBlock)
	}
	if (!hasDependenciesJsonImport) {
		importsToInsert.push(
			`import dependenciesJson from ${quote}./dependency-previews.json${quote}`,
		)
	}
	if (importsToInsert.length > 0) {
		const insertAt = findImportInsertionIndex(newContent)
		const insertion = importsToInsert.join(eol + eol) + eol + eol
		newContent =
			newContent.slice(0, insertAt) + insertion + newContent.slice(insertAt)
	}

	const block = dependencyPreviewsBlock(
		framework,
		sourceRootUrl,
		indent,
		eol,
		quote,
	)
	const hasDefaultParamsSpread = /\.\.\.defaultPreviewParameters\b/.test(
		newContent,
	)

	const paramsMatch = newContent.match(/(parameters\s*:\s*\{)/)
	if (paramsMatch && paramsMatch.index !== undefined) {
		const insertAt = paramsMatch.index + paramsMatch[0].length
		const insertion = hasDefaultParamsSpread
			? `${eol}${block}`
			: `${eol}${l2}...defaultPreviewParameters,${eol}${block}`
		newContent =
			newContent.slice(0, insertAt) + insertion + newContent.slice(insertAt)
	} else if (/\bparameters\s*:/.test(newContent)) {
		// `parameters:` exists but isn't a literal `{ … }` object (probably a
		// variable, spread, or function call). Inserting another `parameters:`
		// would produce a duplicate key — bail with guidance instead.
		return {
			kind: 'failed',
			reason:
				'Preview config already defines `parameters` in a non-literal-object form — please manually add `...defaultPreviewParameters` and the `dependencyPreviews` block to the existing parameters definition.',
		}
	} else {
		const objectOpener = newContent.match(
			/(StorybookPreviewConfig\s*=\s*\{|Preview\s*=\s*\{|export\s+default\s*\{)/,
		)
		if (!objectOpener || objectOpener.index === undefined) {
			return {
				kind: 'failed',
				reason:
					'Could not locate the preview config object — please add the dependencyPreviews parameters manually.',
			}
		}
		const insertAt = objectOpener.index + objectOpener[0].length
		const insertion = `${eol}${l1}parameters: {${eol}${l2}...defaultPreviewParameters,${eol}${block}${eol}${l1}},`
		newContent =
			newContent.slice(0, insertAt) + insertion + newContent.slice(insertAt)
	}

	const decoratorsMatch = newContent.match(/(decorators\s*:\s*\[)/)
	if (decoratorsMatch && decoratorsMatch.index !== undefined) {
		const insertAt = decoratorsMatch.index + decoratorsMatch[0].length
		const insertion = `${eol}${l2}...dependencyPreviewDecorators,`
		newContent =
			newContent.slice(0, insertAt) + insertion + newContent.slice(insertAt)
	} else if (/\bdecorators\s*:/.test(newContent)) {
		return {
			kind: 'failed',
			reason:
				'Preview config already defines `decorators` in a non-literal-array form — please manually add `...dependencyPreviewDecorators` to the existing decorators definition.',
		}
	} else {
		const objectOpener = newContent.match(
			/(StorybookPreviewConfig\s*=\s*\{|Preview\s*=\s*\{|export\s+default\s*\{)/,
		)
		if (!objectOpener || objectOpener.index === undefined) {
			return {
				kind: 'failed',
				reason:
					'Could not locate the preview config object — please add `...dependencyPreviewDecorators` to the decorators array manually.',
			}
		}
		const insertAt = objectOpener.index + objectOpener[0].length
		const insertion = `${eol}${l1}decorators: [...dependencyPreviewDecorators],`
		newContent =
			newContent.slice(0, insertAt) + insertion + newContent.slice(insertAt)
	}

	try {
		writeFileSync(previewFile.path, newContent, 'utf8')
	} catch (e) {
		return {
			kind: 'failed',
			reason: `Could not write ${previewFile.path}: ${(e as Error).message}`,
		}
	}
	return { kind: 'patched', path: previewFile.path }
}

export function patchPreviewFile(opts: {
	storybookDir: string
	previewFile: PreviewFile | null
	framework: Framework
	sourceRootUrl: string
}): PreviewPatchResult {
	const { storybookDir, previewFile, framework, sourceRootUrl } = opts

	if (
		framework !== 'react-vite' &&
		framework !== 'sveltekit' &&
		framework !== 'svelte-vite'
	) {
		return {
			kind: 'failed',
			reason: `Preview patcher does not support framework "${framework}".`,
		}
	}

	if (previewFile) {
		return patchExistingPreview(previewFile, framework, sourceRootUrl)
	}

	const { content, lang } = templateForFramework(framework, sourceRootUrl)
	const path = resolve(storybookDir, `preview.${lang}`)
	if (existsSync(path)) {
		return { kind: 'skipped', reason: `${path} already exists` }
	}
	try {
		writeFileSync(path, content, 'utf8')
	} catch (e) {
		return {
			kind: 'failed',
			reason: `Could not create ${path}: ${(e as Error).message}`,
		}
	}
	return { kind: 'created', path }
}
