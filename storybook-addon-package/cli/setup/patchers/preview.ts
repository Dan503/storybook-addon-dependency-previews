import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { Framework, MainFile, PreviewFile } from '../detect.js'
import {
	detectEol,
	detectFileIndent,
	detectQuoteStyle,
	findMatchingBrace,
	findTopLevelKey,
	stripCommentsRespectingStrings,
} from '../util.js'

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
	// `sourceRootUrl` is required by `DependencyPreviewStorybookParameters`, so
	// always emit it — even an empty string is better than a TS error.
	// JSON.stringify always emits double quotes; convert when the file uses single
	// quotes so the inserted line matches surrounding style. URLs in practice contain
	// no characters that need re-escaping, but we still escape backslashes / single
	// quotes / line terminators for safety.
	const serialisedSourceRootUrl =
		quote === '"'
			? JSON.stringify(sourceRootUrl)
			: `'${sourceRootUrl
					.replace(/\\/g, '\\\\')
					.replace(/'/g, "\\'")
					.replace(/\n/g, '\\n')
					.replace(/\r/g, '\\r')}'`
	const lines = [
		`${l2}dependencyPreviews: {`,
		`${l3}dependenciesJson,`,
		`${l3}projectRootPath: new URL(${quote}..${quote}, import.meta.url).pathname,`,
		`${l3}storyModules: import.meta.glob(`,
		`${l4}${quote}${STORY_GLOBS[framework]}${quote},`,
		`${l4}{ eager: false },`,
		`${l3}),`,
		`${l3}sourceRootUrl: ${serialisedSourceRootUrl},`,
		`${l2}},`,
	]
	return lines.join(eol)
}

type TemplateStyle = { indent: string; eol: string }

function buildTemplate(
	framework: SupportedFramework,
	sourceRootUrl: string,
	style: TemplateStyle,
): string {
	const { indent, eol } = style
	const l1 = indent
	const l2 = indent.repeat(2)
	return [
		`/// <reference types="vite/client" />`,
		``,
		`import {`,
		`${l1}defaultPreviewParameters,`,
		`${l1}dependencyPreviewDecorators,`,
		`${l1}type StorybookPreviewConfig,`,
		`} from 'storybook-addon-dependency-previews'`,
		``,
		`import dependenciesJson from './dependency-previews.json'`,
		``,
		`const previewConfig: StorybookPreviewConfig = {`,
		`${l1}parameters: {`,
		`${l2}...defaultPreviewParameters,`,
		dependencyPreviewsBlock(framework, sourceRootUrl, indent, eol),
		`${l1}},`,
		`${l1}decorators: [...dependencyPreviewDecorators],`,
		`}`,
		``,
		`export default previewConfig`,
		``,
	].join(eol)
}

function templateForFramework(
	framework: SupportedFramework,
	sourceRootUrl: string,
	style: TemplateStyle,
): { content: string; lang: PreviewFile['lang'] } {
	return {
		content: buildTemplate(framework, sourceRootUrl, style),
		lang: 'ts',
	}
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

	// `dependencyPreviews:` is the unique parameters key the wizard injects, so its
	// presence means the addon is already wired in. Other markers like the bare
	// `dependencyPreviewDecorators` identifier are too lenient — they'd false-positive
	// on `import { dependencyPreviewDecorators as dpd } …` where the name appears in
	// the import declaration but isn't actually used in any decorators array yet.
	if (/\bdependencyPreviews\s*:/.test(codeOnly)) {
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

	// ─── Imports: collect all imports from the addon package, merge them into one,
	// and either replace the first / delete the rest, or insert a new one if none exist.
	const PKG = 'storybook-addon-dependency-previews'
	// Match the whole import statement including any trailing semicolon and the
	// terminating newline, so that deletions of additional imports don't leave
	// stray `;` lines behind in semicolon-using projects.
	const ADDON_IMPORT_REGEX = new RegExp(
		String.raw`^[\t ]*import\s*(type\s+)?\{([\s\S]*?)\}\s*from\s*['"]storybook-addon-dependency-previews['"]\s*;?[ \t]*(?:\r?\n|$)`,
		'gm',
	)
	const allAddonImports = [...newContent.matchAll(ADDON_IMPORT_REGEX)]
	// Preserve the project's semicolon style on the merged import.
	const usesSemicolons =
		/from\s*['"][^'"]*['"]\s*;/.test(newContent) ||
		allAddonImports.some((m) => /;\s*(?:\r?\n|$)/.test(m[0]!))
	const trailingSemi = usesSemicolons ? ';' : ''
	// Use the comment-stripped content so a commented-out `// import dependenciesJson …`
	// doesn't trick us into skipping the real import (which would leave the inserted
	// `dependencyPreviews` block referencing an undefined identifier).
	const hasDependenciesJsonImport =
		/import\s+dependenciesJson\s+from\s*['"]\.\/dependency-previews\.json['"]/.test(
			codeOnly,
		)

	const requiredValueNames = [
		'defaultPreviewParameters',
		'dependencyPreviewDecorators',
	]
	const requiredTypeNames = isTs ? ['StorybookPreviewConfig'] : []

	// The local binding names for the addon's value imports — usually identical
	// to the original names, but if the user has aliased an import (e.g.
	// `import { defaultPreviewParameters as dp } from '…'`) then the local name
	// is the alias and that's what later spreads need to reference.
	let defaultsLocalName = 'defaultPreviewParameters'
	let decoratorsLocalName = 'dependencyPreviewDecorators'

	if (allAddonImports.length > 0) {
		type Entry = { name: string; alias?: string; isType: boolean }
		const parseEntry = (raw: string, wasTypeOnly: boolean): Entry => {
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

		// Collect every named import from every `from 'storybook-addon-dependency-previews'`
		// statement in the file. Stripping comments inside `{ … }` first so that
		// `import { foo, /* note */ bar }` doesn't produce `/* note */ bar` as a name.
		const existingEntries: Array<Entry> = []
		for (const m of allAddonImports) {
			const wasTypeOnly = !!m[1]
			const importContents = m[2]!
				.replace(/\/\*[\s\S]*?\*\//g, '')
				.replace(/\/\/.*$/gm, '')
			for (const raw of importContents
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean)) {
				existingEntries.push(parseEntry(raw, wasTypeOnly))
			}
		}

		// Deduplicate by name. Value-imports beat type-imports if both exist for the
		// same name (you can use a value at runtime AND in type positions, but not
		// vice-versa).
		const byName = new Map<string, Entry>()
		for (const e of existingEntries) {
			const prev = byName.get(e.name)
			if (!prev || (prev.isType && !e.isType)) byName.set(e.name, e)
		}
		const dedupedExisting = Array.from(byName.values())

		const requiredValueSet = new Set(requiredValueNames)

		// Promote any existing entry whose name matches a required value to a value
		// import. This handles e.g. `import type { defaultPreviewParameters } from ...` —
		// without promotion we'd leave it as a type and the runtime spread would fail.
		const mergedEntries: Array<Entry> = dedupedExisting.map((e) =>
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

		const isMultipleImports = allAddonImports.length > 1
		const noPromotionNeeded = dedupedExisting.every(
			(e) => mergedEntries.find((m) => m.name === e.name)?.isType === e.isType,
		)
		const allRequiredAlreadyValueImported = requiredValueNames.every((n) =>
			dedupedExisting.some((e) => e.name === n && !e.isType),
		)
		const allRequiredAlreadyTypeImported = requiredTypeNames.every((n) =>
			dedupedExisting.some((e) => e.name === n && e.isType),
		)
		// Skip the rewrite only when there's a single import AND nothing about it
		// needs to change. With multiple imports we always merge to avoid duplicate
		// identifier bindings between them.
		const nothingToDo =
			!isMultipleImports &&
			noPromotionNeeded &&
			allRequiredAlreadyValueImported &&
			allRequiredAlreadyTypeImported

		if (!nothingToDo) {
			// The regex consumes the trailing newline, so include one in the
			// replacement; also tack on the project's semicolon style.
			const replacement = `import {${eol}${mergedEntries
				.map((e) => `${indent}${formatEntry(e)},`)
				.join(eol)}${eol}} from ${quote}${PKG}${quote}${trailingSemi}${eol}`
			// Replace the first import with the merged version; delete the rest.
			let firstReplaced = false
			newContent = newContent.replace(ADDON_IMPORT_REGEX, () => {
				if (!firstReplaced) {
					firstReplaced = true
					return replacement
				}
				return ''
			})
			// Tidy up any blank-line runs left behind by deleted imports.
			newContent = newContent.replace(/(\r?\n){3,}/g, `${eol}${eol}`)
		}

		// Resolve the local binding names — if the user aliased an import we need
		// to reference the alias in the inserted spreads, not the original name.
		const findLocalName = (name: string): string => {
			const entry = mergedEntries.find((m) => m.name === name && !m.isType)
			return entry?.alias ?? name
		}
		defaultsLocalName = findLocalName('defaultPreviewParameters')
		decoratorsLocalName = findLocalName('dependencyPreviewDecorators')
	}

	const importsToInsert: string[] = []
	if (allAddonImports.length === 0) {
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

	/**
	 * Locate the preview config object's body so all the key lookups below
	 * are scoped to *that* object. Without this, a `parameters:` /
	 * `decorators:` belonging to some unrelated object earlier in the file
	 * would be matched instead of the one we want to patch.
	 *
	 * The opener regex runs against the position-preserving comment-stripped
	 * text so an example like `// const preview: Preview = { ... }` in a
	 * comment can't hijack the search — `match.index` from the stripped
	 * content lines up with the original.
	 */
	const findPreviewBody = (text: string): { from: number; to: number } | null => {
		const stripped = stripCommentsRespectingStrings(text)
		const bodyAt = (
			match: RegExpMatchArray | null,
		): { from: number; to: number } | null => {
			if (!match || match.index === undefined) return null
			const openBraceIdx = match.index + match[0].length - 1
			if (text[openBraceIdx] !== '{') return null
			const closeIdx = findMatchingBrace(text, openBraceIdx)
			if (closeIdx === null) return null
			return { from: openBraceIdx + 1, to: closeIdx }
		}

		// Direct patterns: typed preview (`Preview = {`, `StorybookPreviewConfig = {`)
		// or anonymous default export (`export default {`).
		const direct = bodyAt(
			stripped.match(
				/(StorybookPreviewConfig\s*=\s*\{|Preview\s*=\s*\{|export\s+default\s*\{)/,
			),
		)
		if (direct) return direct

		// Fallback: untyped `const preview = { … }; export default preview` (common
		// in `.js` / `.jsx` preview files where there's no type annotation).
		// Resolve `export default <ident>` to its `(const|let|var) <ident> = {…}`
		// declaration and use that object's body.
		const exportIdent = stripped.match(
			/export\s+default\s+([A-Za-z_$][\w$]*)\b/,
		)?.[1]
		if (!exportIdent) return null
		const escaped = exportIdent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
		return bodyAt(
			stripped.match(new RegExp(`(?:const|let|var)\\s+${escaped}\\s*=\\s*\\{`)),
		)
	}

	const bodyRange = findPreviewBody(newContent)
	if (!bodyRange) {
		return {
			kind: 'failed',
			reason:
				'Could not locate the preview config object — please add the dependencyPreviews parameters and decorators manually.',
		}
	}

	// If we end up creating a brand-new `parameters:` key, remember the position
	// right after it so a brand-new `decorators:` insertion can land *after* it
	// rather than at the same body-start position.
	let paramsCreatedEndOffset: number | null = null

	const paramsKey = findTopLevelKey(newContent, 'parameters', bodyRange)
	if (paramsKey && newContent[paramsKey.valueStart] === '{') {
		// Check for an existing `...<local>` spread, but only inside the parameters
		// object itself (and only in real code, not comments or strings). A match
		// anywhere else in the file would falsely suppress the spread we need to
		// insert. `<local>` is the project's local binding for `defaultPreviewParameters`,
		// which differs from the canonical name when the user has aliased the import.
		const paramsBodyEnd = findMatchingBrace(newContent, paramsKey.valueStart)
		const paramsBodyStart = paramsKey.valueStart + 1
		const localSpreadRegex = new RegExp(
			String.raw`\.\.\.${defaultsLocalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\b`,
		)
		const hasDefaultParamsSpread =
			paramsBodyEnd !== null &&
			localSpreadRegex.test(
				stripCommentsRespectingStrings(
					newContent.slice(paramsBodyStart, paramsBodyEnd),
				),
			)
		const insertAt = paramsBodyStart
		const insertion = hasDefaultParamsSpread
			? `${eol}${block}`
			: `${eol}${l2}...${defaultsLocalName},${eol}${block}`
		newContent =
			newContent.slice(0, insertAt) + insertion + newContent.slice(insertAt)
	} else if (paramsKey) {
		// `parameters:` exists but isn't a literal `{ … }` object (probably a
		// variable, spread, or function call). Inserting another `parameters:`
		// would produce a duplicate key — bail with guidance instead.
		return {
			kind: 'failed',
			reason:
				'Preview config already defines `parameters` in a non-literal-object form — please manually add `...defaultPreviewParameters` and the `dependencyPreviews` block to the existing parameters definition.',
		}
	} else {
		const insertAt = bodyRange.from
		const insertion = `${eol}${l1}parameters: {${eol}${l2}...${defaultsLocalName},${eol}${block}${eol}${l1}},`
		newContent =
			newContent.slice(0, insertAt) + insertion + newContent.slice(insertAt)
		// Track where the just-inserted parameters block ends, so a subsequent
		// "create new decorators" can be placed *after* it (the bodyRange.from
		// position is shared with parameters; without this offset, decorators
		// would be inserted at body-start and end up *before* parameters).
		paramsCreatedEndOffset = insertAt + insertion.length
	}

	// Re-find the body range after the params insertion — the body's closing
	// brace position has shifted but the helper handles that transparently.
	const bodyRangeAfterParams = findPreviewBody(newContent) ?? bodyRange
	const decoratorsKey = findTopLevelKey(
		newContent,
		'decorators',
		bodyRangeAfterParams,
	)
	if (decoratorsKey && newContent[decoratorsKey.valueStart] === '[') {
		// Mirror the parameters-spread idempotency: only insert the spread if the
		// decorators array doesn't already contain `...<localName>`. Catches the
		// "user partially set up by hand" case (the wizard may have just added
		// `dependencyPreviews:` parameters and the user might already have wired
		// the decorators).
		const decoratorsBodyEnd = findMatchingBrace(newContent, decoratorsKey.valueStart)
		const decoratorsBodyStart = decoratorsKey.valueStart + 1
		const localDecoratorsSpreadRegex = new RegExp(
			String.raw`\.\.\.${decoratorsLocalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\b`,
		)
		const hasDecoratorsSpread =
			decoratorsBodyEnd !== null &&
			localDecoratorsSpreadRegex.test(
				stripCommentsRespectingStrings(
					newContent.slice(decoratorsBodyStart, decoratorsBodyEnd),
				),
			)
		if (!hasDecoratorsSpread) {
			const insertAt = decoratorsBodyStart
			const insertion = `${eol}${l2}...${decoratorsLocalName},`
			newContent =
				newContent.slice(0, insertAt) + insertion + newContent.slice(insertAt)
		}
	} else if (decoratorsKey) {
		return {
			kind: 'failed',
			reason:
				'Preview config already defines `decorators` in a non-literal-array form — please manually add `...dependencyPreviewDecorators` to the existing decorators definition.',
		}
	} else {
		// If we just inserted a brand-new `parameters:` key in this same run,
		// position the new `decorators:` *after* it. Otherwise place it at the
		// start of the preview config body.
		const insertAt = paramsCreatedEndOffset ?? bodyRangeAfterParams.from
		const insertion = `${eol}${l1}decorators: [...${decoratorsLocalName}],`
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
	mainFile: MainFile
	framework: Framework
	sourceRootUrl: string
}): PreviewPatchResult {
	const { storybookDir, previewFile, mainFile, framework, sourceRootUrl } = opts

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

	// Derive indent and EOL from the existing main.{ts,js,...} so the brand-new
	// preview file matches the project's style instead of always using tabs / LF.
	let style: TemplateStyle = { indent: '\t', eol: '\n' }
	try {
		const mainContent = readFileSync(mainFile.path, 'utf8')
		style = {
			indent: detectFileIndent(mainContent),
			eol: detectEol(mainContent),
		}
	} catch {
		// If main.ts can't be read for some reason, fall back to the defaults.
	}

	const { content, lang } = templateForFramework(framework, sourceRootUrl, style)
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
