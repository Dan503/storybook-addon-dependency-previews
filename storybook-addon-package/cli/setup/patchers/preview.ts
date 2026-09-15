import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import {
	isFrameworkSupported,
	type Framework,
	type MainFile,
	type PreviewFile,
	type SupportedFramework,
} from '../detect.js'
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

// Brace expansion `{a,b,c}` works under both Vite 7 (micromatch) and Vite 8
// (tinyglobby). Extglob `@(a|b|c)` silently returns zero matches under tinyglobby,
// which was the root cause of every wizard-generated preview.ts on Vite 8 showing
// "No story module found at this path: …" for every story.
//
// Every currently-supported framework uses the same union extension list, so this is
// a single suffix rather than a per-framework record. `dependencyPreviewsBlock` still
// takes `framework` so future per-framework divergence (a glob a framework should
// strictly exclude, say) is a one-line change here, not a signature shuffle.
// Matches both the plural `.stories.` (default) and singular `.story.` naming —
// the `storybookFileExtension` config lets a project pick either. Brace
// expansion `{story,stories}` (NOT extglob `@(story|stories)`, which returns
// zero matches under Vite 8 / tinyglobby) keeps both discoverable.
const STORY_GLOB_SUFFIX = '**/*.{story,stories}.{tsx,ts,jsx,js,svelte}'

/**
 * Build the story-module glob from the resolved `srcDir`. Empty `srcDir`
 * (project root is the source folder) drops the subfolder anchor entirely;
 * any other value gates the glob to that folder.
 */
function storyGlobFor(srcDir: string): string {
	return srcDir === '' ? `/${STORY_GLOB_SUFFIX}` : `/${srcDir}/${STORY_GLOB_SUFFIX}`
}

function dependencyPreviewsBlock(
	framework: SupportedFramework,
	sourceRootUrl: string,
	srcDir: string,
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
	const storyGlob = storyGlobFor(srcDir)
	const lines = [
		`${l2}dependencyPreviews: {`,
		`${l3}dependenciesJson,`,
		`${l3}projectRootPath: new URL(${quote}..${quote}, import.meta.url).pathname,`,
		`${l3}storyModules: import.meta.glob(`,
		`${l4}${quote}${storyGlob}${quote},`,
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
	srcDir: string,
	style: TemplateStyle,
	isTs: boolean,
): string {
	const { indent, eol } = style
	const l1 = indent
	const l2 = indent.repeat(2)
	const lines = [
		// `/// <reference types="vite/client" />` is a TypeScript-only directive;
		// Vite-flavoured JS preview files don't need it.
		...(isTs ? [`/// <reference types="vite/client" />`, ``] : []),
		`import {`,
		`${l1}defaultPreviewParameters,`,
		// The `type StorybookPreviewConfig` import is meaningless in JS — drop it.
		`${l1}dependencyPreviewDecorators,${isTs ? `${eol}${l1}type StorybookPreviewConfig,` : ''}`,
		`} from 'storybook-addon-dependency-previews'`,
		``,
		`import dependenciesJson from './dependency-previews.json'`,
		``,
		// Same: skip the type annotation in JS.
		isTs
			? `const previewConfig: StorybookPreviewConfig = {`
			: `const previewConfig = {`,
		`${l1}parameters: {`,
		`${l2}...defaultPreviewParameters,`,
		dependencyPreviewsBlock(framework, sourceRootUrl, srcDir, indent, eol),
		`${l1}},`,
		`${l1}decorators: [...dependencyPreviewDecorators],`,
		`}`,
		``,
		`export default previewConfig`,
		``,
	]
	return lines.join(eol)
}

/**
 * The package a CSF Next `preview.ts` imports `definePreview` from, per
 * framework — only the frameworks whose package exports it. At the time of
 * writing `@storybook/preact-vite`, `@storybook/sveltekit` and
 * `@storybook/svelte-vite` do not, so those frameworks are absent and keep the
 * classic template (which works on Storybook 10 and 11 alike). Adding a
 * framework here is what switches its Storybook 11 projects to the CSF Next
 * template.
 */
const DEFINE_PREVIEW_PACKAGE_BY_FRAMEWORK: Partial<
	Record<SupportedFramework, string>
> = {
	'react-vite': '@storybook/react-vite',
	'vue3-vite': '@storybook/vue3-vite',
	'solid-vite': 'storybook-solidjs-vite',
}

/** The first Storybook major whose default `preview.ts` style is CSF Next. */
const FIRST_STORYBOOK_MAJOR_WITH_CSF_NEXT = 11

interface BuildDefinePreviewTemplateParams {
	/** Decides the story glob in the settings block. */
	framework: SupportedFramework
	/** The package `definePreview` is imported from (see `DEFINE_PREVIEW_PACKAGE_BY_FRAMEWORK`). */
	definePreviewPackage: string
	/** The project's source-root URL, written into the settings block. */
	sourceRootUrl: string
	/** The resolved source folder, written into the story glob. */
	srcDir: string
	/** Indent and line ending for the new file. */
	style: TemplateStyle
	/** Whether the file is TypeScript — decides the `vite/client` reference line. */
	isTs: boolean
}

/**
 * The CSF Next preview file: `export default definePreview({ ... })` with the
 * addon registered through `dependencyPreviews()` in `addons`, alongside the
 * docs addon. The registration function carries the default parameters and
 * the decorators, so unlike `buildTemplate` nothing is spread in by hand.
 */
function buildDefinePreviewTemplate({
	framework,
	definePreviewPackage,
	sourceRootUrl,
	srcDir,
	style,
	isTs,
}: BuildDefinePreviewTemplateParams): string {
	const { indent, eol } = style
	const l1 = indent
	const lines = [
		// `/// <reference types="vite/client" />` is a TypeScript-only directive;
		// Vite-flavoured JS preview files don't need it.
		...(isTs ? [`/// <reference types="vite/client" />`, ``] : []),
		`import { definePreview } from '${definePreviewPackage}'`,
		`import addonDocs from '@storybook/addon-docs'`,
		`import { dependencyPreviews } from 'storybook-addon-dependency-previews'`,
		``,
		`import dependenciesJson from './dependency-previews.json'`,
		``,
		`export default definePreview({`,
		`${l1}addons: [addonDocs(), dependencyPreviews()],`,
		`${l1}parameters: {`,
		dependencyPreviewsBlock(framework, sourceRootUrl, srcDir, indent, eol),
		`${l1}},`,
		`})`,
		``,
	]
	return lines.join(eol)
}

/**
 * Map the detected `.storybook/main.{ts,js,mjs,cjs}` extension to the matching
 * preview-file extension. The `PreviewFile['lang']` type only models the four
 * extensions Storybook actually loads as a preview module — `mjs`/`cjs` mains
 * still imply a `js` preview, so they collapse to `'js'` here.
 */
function previewLangForMainLang(
	mainLang: MainFile['lang'],
): PreviewFile['lang'] {
	return mainLang === 'ts' ? 'ts' : 'js'
}

interface TemplateForFrameworkParams {
	/** Decides the story glob, and whether a CSF Next template is available. */
	framework: SupportedFramework
	/** The project's source-root URL, written into the settings block. */
	sourceRootUrl: string
	/** The resolved source folder, written into the story glob. */
	srcDir: string
	/** Indent and line ending for the new file. */
	style: TemplateStyle
	/** The main file's extension — decides whether the preview is `.ts` or `.js`. */
	mainLang: MainFile['lang']
	/** Major version of the installed `storybook` package; `null` when unknown. */
	storybookMajor: number | null
}

/**
 * Pick the template for a brand-new preview file. Storybook 11 projects on a
 * framework whose package exports `definePreview` get the CSF Next template;
 * everything else — Storybook 10, a framework without `definePreview`, or a
 * version that could not be read — gets the classic template, which works on
 * both majors.
 */
function templateForFramework({
	framework,
	sourceRootUrl,
	srcDir,
	style,
	mainLang,
	storybookMajor,
}: TemplateForFrameworkParams): { content: string; lang: PreviewFile['lang'] } {
	const lang = previewLangForMainLang(mainLang)
	const isTs = lang === 'ts'
	const definePreviewPackage = DEFINE_PREVIEW_PACKAGE_BY_FRAMEWORK[framework]
	const isCsfNextDefault =
		storybookMajor !== null &&
		storybookMajor >= FIRST_STORYBOOK_MAJOR_WITH_CSF_NEXT
	if (isCsfNextDefault && definePreviewPackage) {
		return {
			content: buildDefinePreviewTemplate({
				framework,
				definePreviewPackage,
				sourceRootUrl,
				srcDir,
				style,
				isTs,
			}),
			lang,
		}
	}
	return {
		content: buildTemplate(framework, sourceRootUrl, srcDir, style, isTs),
		lang,
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

const PKG = 'storybook-addon-dependency-previews'

/** The formatting of an existing preview file that inserted code has to match. */
interface PreviewFileStyle {
	indent: string
	eol: string
	quote: "'" | '"'
	/** `';'` when the file ends its import statements with semicolons, else `''`. */
	trailingSemi: string
}

interface MergeAddonImportParams {
	/** The file's current content. */
	content: string
	/** The value names the patched file must import from the addon package. */
	requiredValueNames: ReadonlyArray<string>
	/** The type names it must import — TypeScript only, and empty otherwise. */
	requiredTypeNames: ReadonlyArray<string>
	/** The file's formatting, for the rewritten or fresh import statement. */
	style: PreviewFileStyle
}

interface MergedAddonImport {
	/** The content with the existing addon imports merged into one, else unchanged. */
	content: string
	/**
	 * The local binding name for each required value name — the alias when the
	 * file imported it under one (`import { dependencyPreviews as dp } …`),
	 * which is the name the inserted code then has to use.
	 */
	localNames: Map<string, string>
	/**
	 * The import statement to insert when the file had no import from the addon
	 * package at all; `null` when an existing import was merged instead.
	 */
	importToInsert: string | null
}

/**
 * Make sure the file imports the required names from the addon package.
 * Collects every existing import from the package, merges them into one
 * (promoting a `type` import of a required value to a value import, and
 * keeping any alias), and either rewrites the first statement and deletes
 * the rest, or — when there is none — hands back a fresh statement for the
 * caller to insert with its other imports.
 */
function mergeAddonImport({
	content,
	requiredValueNames,
	requiredTypeNames,
	style,
}: MergeAddonImportParams): MergedAddonImport {
	const { indent, eol, quote, trailingSemi } = style
	// Match the whole import statement including any trailing semicolon and the
	// terminating newline, so that deletions of additional imports don't leave
	// stray `;` lines behind in semicolon-using projects. The name list is
	// `[^}]*` rather than `[\s\S]*?`: a lazy any-character group can start at
	// an earlier `import {` from another package and run on until it reaches
	// the addon's `} from …`, swallowing every import in between.
	const ADDON_IMPORT_REGEX = new RegExp(
		String.raw`^[\t ]*import\s*(type\s+)?\{([^}]*)\}\s*from\s*['"]storybook-addon-dependency-previews['"]\s*;?[ \t]*(?:\r?\n|$)`,
		'gm',
	)
	const allAddonImports = [...content.matchAll(ADDON_IMPORT_REGEX)]
	const localNames = new Map(requiredValueNames.map((n) => [n, n]))

	if (allAddonImports.length === 0) {
		const entries = [
			...requiredValueNames,
			...requiredTypeNames.map((n) => `type ${n}`),
		]
		const fromClause = `from ${quote}${PKG}${quote}${trailingSemi}`
		const importToInsert =
			entries.length === 1
				? `import { ${entries[0]} } ${fromClause}`
				: [
						`import {`,
						...entries.map((e) => `${indent}${e},`),
						`} ${fromClause}`,
					].join(eol)
		return { content, localNames, importToInsert }
	}

	type Entry = { name: string; alias?: string; isType: boolean }
	const parseEntry = (raw: string, wasTypeOnly: boolean): Entry => {
		// `import type { A, B }` makes every name a type, so respect that.
		const isType = wasTypeOnly || /^type\s+/.test(raw)
		const stripped = raw.replace(/^type\s+/, '')
		const [name, alias] = stripped.split(/\s+as\s+/).map((s) => s.trim())
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

	let newContent = content
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
	// to reference the alias in the inserted code, not the original name.
	for (const name of requiredValueNames) {
		const entry = mergedEntries.find((m) => m.name === name && !m.isType)
		localNames.set(name, entry?.alias ?? name)
	}
	return { content: newContent, localNames, importToInsert: null }
}

/**
 * The `import dependenciesJson from './dependency-previews.json'` statement to
 * insert, or `null` when the file already has it. Checked against the
 * comment-stripped content so a commented-out copy doesn't trick us into
 * skipping the real import (which would leave the inserted
 * `dependencyPreviews` block referencing an undefined identifier).
 *
 * @param codeOnly - the file content with comments stripped
 * @param style - the file's formatting
 */
function dependenciesJsonImportToInsert(
	codeOnly: string,
	style: PreviewFileStyle,
): string | null {
	const hasDependenciesJsonImport =
		/import\s+dependenciesJson\s+from\s*['"]\.\/dependency-previews\.json['"]/.test(
			codeOnly,
		)
	if (hasDependenciesJsonImport) return null
	const { quote, trailingSemi } = style
	return `import dependenciesJson from ${quote}./dependency-previews.json${quote}${trailingSemi}`
}

interface InsertImportsParams {
	/** The file's current content. */
	content: string
	/** Whole import statements, each already in the file's style. */
	statements: ReadonlyArray<string>
	/** The file's line ending. */
	eol: string
}

/**
 * Insert import statements at the top of the file, after any leading
 * comments and directives, each separated by a blank line.
 */
function insertImports({
	content,
	statements,
	eol,
}: InsertImportsParams): string {
	if (statements.length === 0) return content
	const insertAt = findImportInsertionIndex(content)
	const insertion = statements.join(eol + eol) + eol + eol
	return content.slice(0, insertAt) + insertion + content.slice(insertAt)
}

/**
 * The range inside the `{ … }` whose opening brace is the last character of
 * `match` — `from` just after the brace, `to` at its matching closer.
 *
 * @param text - the original file content (the match came from its
 * comment-stripped twin, whose positions line up with it)
 * @param match - a match ending in the opening brace, or `null`
 */
function objectBodyAfterMatch(
	text: string,
	match: RegExpMatchArray | null,
): { from: number; to: number } | null {
	if (!match || match.index === undefined) return null
	const openBraceIdx = match.index + match[0].length - 1
	if (text[openBraceIdx] !== '{') return null
	const closeIdx = findMatchingBrace(text, openBraceIdx)
	if (closeIdx === null) return null
	return { from: openBraceIdx + 1, to: closeIdx }
}

/**
 * Locate the classic preview config object's body so the key lookups are
 * scoped to *that* object. Without this, a `parameters:` / `decorators:`
 * belonging to some unrelated object earlier in the file would be matched
 * instead of the one we want to patch.
 *
 * The opener regex runs against the position-preserving comment-stripped
 * text so an example like `// const preview: Preview = { ... }` in a
 * comment can't hijack the search — `match.index` from the stripped
 * content lines up with the original.
 *
 * @param text - the file content
 */
function findPreviewBody(text: string): { from: number; to: number } | null {
	const stripped = stripCommentsRespectingStrings(text)

	// Direct patterns: typed preview (`Preview = {`, `StorybookPreviewConfig = {`)
	// or anonymous default export (`export default {`).
	const direct = objectBodyAfterMatch(
		text,
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
	return objectBodyAfterMatch(
		text,
		stripped.match(new RegExp(`(?:const|let|var)\\s+${escaped}\\s*=\\s*\\{`)),
	)
}

/**
 * Locate the body of the object passed to `definePreview({ … })` in a CSF
 * Next preview file — the style Storybook 11 makes the default. Only the
 * default export counts: `export default definePreview({` directly, or
 * `export default <name>` resolved to its `const <name> = definePreview({`
 * declaration — so a stray `definePreview` call elsewhere in the file is not
 * mistaken for the config. Runs on the comment-stripped text like
 * `findPreviewBody`, so a `definePreview` that only appears in a comment is
 * ignored. `null` when the file is not in this style.
 *
 * @param text - the file content
 */
function findDefinePreviewBody(
	text: string,
): { from: number; to: number } | null {
	const stripped = stripCommentsRespectingStrings(text)

	const direct = objectBodyAfterMatch(
		text,
		stripped.match(/export\s+default\s+definePreview\s*\(\s*\{/),
	)
	if (direct) return direct

	const exportIdent = stripped.match(
		/export\s+default\s+([A-Za-z_$][\w$]*)\b/,
	)?.[1]
	if (!exportIdent) return null
	const escaped = exportIdent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	return objectBodyAfterMatch(
		text,
		stripped.match(
			new RegExp(
				`(?:const|let|var)\\s+${escaped}\\s*=\\s*definePreview\\s*\\(\\s*\\{`,
			),
		),
	)
}

/**
 * Write the patched content back to the preview file.
 *
 * @param previewFile - the file being patched
 * @param content - the patched content
 */
function writePreview(
	previewFile: PreviewFile,
	content: string,
): PreviewPatchResult {
	try {
		writeFileSync(previewFile.path, content, 'utf8')
	} catch (e) {
		return {
			kind: 'failed',
			reason: `Could not write ${previewFile.path}: ${(e as Error).message}`,
		}
	}
	return { kind: 'patched', path: previewFile.path }
}

/**
 * The local name a file gives a package's default import — `import docs from
 * '@storybook/addon-docs'` gives `docs`, and so does `import docs, { X } from
 * '…'`. `null` when the file has no default import from that package.
 *
 * @param codeOnly - the file content with comments stripped
 * @param packageName - the package the import must come from
 */
function findDefaultImportLocalName(
	codeOnly: string,
	packageName: string,
): string | null {
	const escapedPackageName = packageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	const match = codeOnly.match(
		new RegExp(
			String.raw`import\s+(?!type\s)([A-Za-z_$][\w$]*)\s*(?:,\s*\{[^}]*\})?\s*from\s*['"]${escapedPackageName}['"]`,
		),
	)
	return match?.[1] ?? null
}

interface AddListEntriesParams {
	/** The file content. */
	content: string
	/** Position just after the list's `[`. */
	listStart: number
	/** Position of the list's `]`. */
	listEnd: number
	/** The entries to add at the front of the list. */
	entries: ReadonlyArray<string>
	/** The file's formatting, for the multi-line case. */
	style: PreviewFileStyle
}

/**
 * Add entries at the front of a `[ … ]` list, keeping its layout: one entry
 * per line in a multi-line list, comma-and-space in a single-line one (after
 * any space that follows the `[`), and just the entries in an empty list.
 */
function addListEntries({
	content,
	listStart,
	listEnd,
	entries,
	style,
}: AddListEntriesParams): string {
	const { indent, eol } = style
	const listText = content.slice(listStart, listEnd)
	const before = content.slice(0, listStart)
	const isMultiLineList = /\r?\n/.test(listText)
	if (isMultiLineList) {
		const l2 = indent.repeat(2)
		const insertion = `${eol}${l2}${entries.join(`,${eol}${l2}`)},`
		return before + insertion + content.slice(listStart)
	}
	const isEmptyList = listText.trim() === ''
	if (isEmptyList) {
		return before + entries.join(', ') + content.slice(listEnd)
	}
	const leadingSpaces = listText.match(/^[ \t]*/)![0]
	const insertAt = listStart + leadingSpaces.length
	const insertion = `${entries.join(', ')}, `
	return content.slice(0, insertAt) + insertion + content.slice(insertAt)
}

interface PatchDefinePreviewParams {
	/** The file being patched — written back at the end. */
	previewFile: PreviewFile
	/** The file's current content. */
	content: string
	/** `content` with comments stripped, for the identifier checks. */
	codeOnly: string
	/** The file's formatting, matched by everything inserted. */
	style: PreviewFileStyle
	/** Decides the story glob in the settings block. */
	framework: SupportedFramework
	/** The project's source-root URL, written into the settings block. */
	sourceRootUrl: string
	/** The resolved source folder, written into the story glob. */
	srcDir: string
}

/**
 * Patch a CSF Next `export default definePreview({ … })` preview file. The
 * addon is registered by calling `dependencyPreviews()` in `addons` (which
 * carries the default parameters and the decorators, so nothing is spread
 * into `parameters` or `decorators` here) alongside the docs addon, and the
 * `dependencyPreviews` settings block goes into `parameters`. Missing
 * `addons` / `parameters` keys and missing imports are created; an existing
 * docs-addon registration under any local name is kept.
 */
function patchDefinePreview({
	previewFile,
	content,
	codeOnly,
	style,
	framework,
	sourceRootUrl,
	srcDir,
}: PatchDefinePreviewParams): PreviewPatchResult {
	const { indent, eol, quote, trailingSemi } = style
	const l1 = indent

	// ─── Imports.
	const importsToInsert: string[] = []

	// `dependencyPreviews` is also the package's default export, and the docs
	// used to show it imported that way — `import dependencyPreviews from '…'`
	// — so a file may already bind it under a default import (possibly with a
	// named list after it). That binding is used as is; merging a named import
	// on top would declare the same name twice.
	const defaultAddonImportLocal = findDefaultImportLocalName(codeOnly, PKG)
	let dependencyPreviewsLocal: string
	let contentAfterImportMerge = content
	if (defaultAddonImportLocal) {
		dependencyPreviewsLocal = defaultAddonImportLocal
	} else {
		const merged = mergeAddonImport({
			content,
			requiredValueNames: ['dependencyPreviews'],
			requiredTypeNames: [],
			style,
		})
		dependencyPreviewsLocal = merged.localNames.get('dependencyPreviews')!
		contentAfterImportMerge = merged.content
		if (merged.importToInsert) importsToInsert.push(merged.importToInsert)
	}

	// The docs addon may already be registered under any local name
	// (`import docs from '@storybook/addon-docs'`); when it is, that name is
	// what the `addons` scan below looks for and no import is added.
	const docsImportLocal = findDefaultImportLocalName(
		codeOnly,
		'@storybook/addon-docs',
	)
	const addonDocsLocal = docsImportLocal ?? 'addonDocs'
	if (!docsImportLocal) {
		importsToInsert.push(
			`import addonDocs from ${quote}@storybook/addon-docs${quote}${trailingSemi}`,
		)
	}

	const dependenciesJsonImport = dependenciesJsonImportToInsert(codeOnly, style)
	if (dependenciesJsonImport) importsToInsert.push(dependenciesJsonImport)

	let newContent = insertImports({
		content: contentAfterImportMerge,
		statements: importsToInsert,
		eol,
	})

	// Located after the import edits, since those shift every later offset.
	const bodyRange = findDefinePreviewBody(newContent)
	if (!bodyRange) {
		return {
			kind: 'failed',
			reason:
				'Could not locate the definePreview config object — please add `addonDocs()` and `dependencyPreviews()` to `addons` and the `dependencyPreviews` parameters manually.',
		}
	}

	// `definePreview({})` and `definePreview({ })` — nothing between the braces
	// and no line break either, so the inserted keys need one before the `}`.
	const isEmptySingleLineBody = /^[ \t]*$/.test(
		newContent.slice(bodyRange.from, bodyRange.to),
	)

	// ─── `addons`: make sure both registrations are in the list.
	// If we create the key, remember where it ends so a created `parameters:`
	// lands after it rather than at the same body-start position.
	let addonsCreatedEndOffset: number | null = null
	const addonsKey = findTopLevelKey(newContent, 'addons', bodyRange)
	if (addonsKey && newContent[addonsKey.valueStart] === '[') {
		const listStart = addonsKey.valueStart + 1
		const listEnd =
			findMatchingBrace(newContent, addonsKey.valueStart) ?? listStart
		const listCode = stripCommentsRespectingStrings(
			newContent.slice(listStart, listEnd),
		)
		const checkIsRegistered = (localName: string): boolean =>
			new RegExp(
				String.raw`\b${localName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\s*\(`,
			).test(listCode)
		const missingEntries = [addonDocsLocal, dependencyPreviewsLocal]
			.filter((localName) => !checkIsRegistered(localName))
			.map((localName) => `${localName}()`)
		if (missingEntries.length > 0) {
			newContent = addListEntries({
				content: newContent,
				listStart,
				listEnd,
				entries: missingEntries,
				style,
			})
		}
	} else if (addonsKey) {
		return {
			kind: 'failed',
			reason:
				'Preview config defines `addons` in a non-literal-array form — please add `addonDocs()` and `dependencyPreviews()` to it manually.',
		}
	} else {
		const insertAt = bodyRange.from
		const insertion = `${eol}${l1}addons: [${addonDocsLocal}(), ${dependencyPreviewsLocal}()],`
		newContent =
			newContent.slice(0, insertAt) + insertion + newContent.slice(insertAt)
		addonsCreatedEndOffset = insertAt + insertion.length
	}

	// ─── `parameters`: insert the settings block.
	const block = dependencyPreviewsBlock(
		framework,
		sourceRootUrl,
		srcDir,
		indent,
		eol,
		quote,
	)
	// Re-find the body — the `addons` edit shifted its closing brace.
	const bodyRangeAfterAddons = findDefinePreviewBody(newContent) ?? bodyRange
	const paramsKey = findTopLevelKey(
		newContent,
		'parameters',
		bodyRangeAfterAddons,
	)
	if (paramsKey && newContent[paramsKey.valueStart] === '{') {
		const insertAt = paramsKey.valueStart + 1
		const paramsEnd =
			findMatchingBrace(newContent, paramsKey.valueStart) ?? insertAt
		// An existing `parameters: {}` needs its `}` moved onto its own line,
		// or the block's last `},` and that `}` end up together as `},}`.
		const isEmptySingleLineParams = /^[ \t]*$/.test(
			newContent.slice(insertAt, paramsEnd),
		)
		const insertion = isEmptySingleLineParams
			? `${eol}${block}${eol}${l1}`
			: `${eol}${block}`
		newContent =
			newContent.slice(0, insertAt) + insertion + newContent.slice(insertAt)
	} else if (paramsKey) {
		return {
			kind: 'failed',
			reason:
				'Preview config already defines `parameters` in a non-literal-object form — please manually add the `dependencyPreviews` block to the existing parameters definition.',
		}
	} else {
		const insertAt = addonsCreatedEndOffset ?? bodyRangeAfterAddons.from
		const insertion = `${eol}${l1}parameters: {${eol}${block}${eol}${l1}},`
		newContent =
			newContent.slice(0, insertAt) + insertion + newContent.slice(insertAt)
	}

	// Without this the closing brace would stay glued to the last inserted
	// line (`},})`).
	if (isEmptySingleLineBody) {
		const bodyRangeAfterParams = findDefinePreviewBody(newContent)
		if (bodyRangeAfterParams) {
			const closeAt = bodyRangeAfterParams.to
			newContent =
				newContent.slice(0, closeAt) + eol + newContent.slice(closeAt)
		}
	}

	return writePreview(previewFile, newContent)
}

function patchExistingPreview(
	previewFile: PreviewFile,
	framework: SupportedFramework,
	sourceRootUrl: string,
	srcDir: string,
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
	// Preserve the project's semicolon style on inserted imports.
	const usesSemicolons = /from\s*['"][^'"]*['"]\s*;/.test(content)
	const style: PreviewFileStyle = {
		indent,
		eol,
		quote,
		trailingSemi: usesSemicolons ? ';' : '',
	}
	const l1 = indent
	const l2 = indent.repeat(2)

	// A CSF Next `export default definePreview({ … })` file is registered
	// through `dependencyPreviews()` rather than the spreads below.
	if (findDefinePreviewBody(content)) {
		return patchDefinePreview({
			previewFile,
			content,
			codeOnly,
			style,
			framework,
			sourceRootUrl,
			srcDir,
		})
	}

	// ─── Imports.
	// Only require `StorybookPreviewConfig` as a type import when the existing
	// preview body actually annotates with that type. A file that already types
	// its config as the framework's own `Preview` (or any other type, or is
	// untyped) keeps that annotation — adding our `StorybookPreviewConfig`
	// import to such a file just produces a dead import that trips
	// `noUnusedLocals` / lint in consumer projects. The CREATE path's template
	// always uses `StorybookPreviewConfig` so this conditional doesn't affect
	// fresh preview files.
	const existingUsesOurType =
		isTs && /:\s*StorybookPreviewConfig\b/.test(codeOnly)
	const requiredTypeNames =
		isTs && existingUsesOurType ? ['StorybookPreviewConfig'] : []
	const merged = mergeAddonImport({
		content,
		requiredValueNames: [
			'defaultPreviewParameters',
			'dependencyPreviewDecorators',
		],
		requiredTypeNames,
		style,
	})
	// The local binding names for the addon's value imports — usually identical
	// to the original names, but if the user has aliased an import (e.g.
	// `import { defaultPreviewParameters as dp } from '…'`) then the local name
	// is the alias and that's what later spreads need to reference.
	const defaultsLocalName = merged.localNames.get('defaultPreviewParameters')!
	const decoratorsLocalName = merged.localNames.get(
		'dependencyPreviewDecorators',
	)!

	const importsToInsert: string[] = []
	if (merged.importToInsert) importsToInsert.push(merged.importToInsert)
	const dependenciesJsonImport = dependenciesJsonImportToInsert(codeOnly, style)
	if (dependenciesJsonImport) importsToInsert.push(dependenciesJsonImport)
	let newContent = insertImports({
		content: merged.content,
		statements: importsToInsert,
		eol,
	})

	const block = dependencyPreviewsBlock(
		framework,
		sourceRootUrl,
		srcDir,
		indent,
		eol,
		quote,
	)

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
		const decoratorsBodyEnd = findMatchingBrace(
			newContent,
			decoratorsKey.valueStart,
		)
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

	return writePreview(previewFile, newContent)
}

export interface PatchPreviewFileOptions {
	/** Absolute path to the project's `.storybook/` directory. */
	storybookDir: string
	/**
	 * Existing preview file detected in `.storybook/` (any of preview.ts /
	 * .tsx / .js / .jsx), or `null` if no preview file exists yet — in which
	 * case the patcher creates a fresh one from the framework template.
	 */
	previewFile: PreviewFile | null
	/**
	 * Detected `.storybook/main.{ts,js,…}`. Used to derive the indent and EOL
	 * style for any newly-created preview file so it matches the project's
	 * existing code style.
	 */
	mainFile: MainFile
	/**
	 * Detected (or user-confirmed) Storybook framework. Determines the story
	 * glob pattern injected into `dependencyPreviews.storyModules` and which
	 * framework template is used when creating a new preview file.
	 */
	framework: Framework
	/**
	 * URL pointing at the project's source-code root (e.g. a GitHub blob
	 * URL). Powers the addon's "view source" links in the Storybook UI. May
	 * be empty — the addon's runtime treats `''` as "no source links" and
	 * the field is required by the addon's parameter type so we always emit
	 * it.
	 */
	sourceRootUrl: string
	/**
	 * Resolved source-folder name (`'src'`, `'app'`, etc.). Empty string is
	 * the deliberate "project root *is* the source folder" sentinel. Drives
	 * the `import.meta.glob` story pattern injected into the preview file.
	 */
	srcDir: string
	/**
	 * Major version of the `storybook` package installed for the project, or
	 * `null` when it is not installed. Decides whether a newly-created preview
	 * file uses the CSF Next `definePreview({ ... })` style (Storybook 11 and
	 * up, on frameworks whose package exports `definePreview`) or the classic
	 * hand-spread style. Existing preview files are patched in whichever style
	 * they already use, regardless of this value.
	 */
	storybookMajor: number | null
}

/**
 * Patch (or create) the project's `.storybook/preview.{ts,tsx,js,jsx}` so
 * the addon is wired in — through `dependencyPreviews()` in a CSF Next
 * `definePreview({ ... })` file, or the parameters and decorators spreads in a
 * classic one. Idempotent — re-runs against an already-configured preview
 * return `{ kind: 'skipped' }`.
 */
export function patchPreviewFile(
	opts: PatchPreviewFileOptions,
): PreviewPatchResult {
	const {
		storybookDir,
		previewFile,
		mainFile,
		framework,
		sourceRootUrl,
		srcDir,
		storybookMajor,
	} = opts

	if (!isFrameworkSupported(framework)) {
		return {
			kind: 'failed',
			reason: `Preview patcher does not support framework "${framework}".`,
		}
	}
	// `framework` is now narrowed to `SupportedFramework` for the rest of the fn.

	if (previewFile) {
		return patchExistingPreview(previewFile, framework, sourceRootUrl, srcDir)
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

	const { content, lang } = templateForFramework({
		framework,
		sourceRootUrl,
		srcDir,
		style,
		mainLang: mainFile.lang,
		storybookMajor,
	})
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
