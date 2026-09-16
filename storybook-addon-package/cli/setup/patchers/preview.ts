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
	blankStringContents,
	detectEol,
	detectFileIndent,
	detectQuoteStyle,
	escapeForRegex,
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

// An optional type annotation on a declaration (`: Foo<A, B>`), for a regex
// that runs from the declared name to its `=`. It stops at `=` and `;`, so a
// declaration with no initializer (`let x: T`) cannot reach the next `=` in
// the file — and for the same reason it only crosses a line break where the
// annotation plainly continues: after `<`, `,`, `(`, `{`, `[`, `|` or `&`,
// or straight before a closing `>`, `)`, `}` or `]` — how a formatter breaks
// a long list of type arguments (`ReactPreview<⏎ A,⏎ B⏎>`). A break after a
// bare name ends it, as it ends the statement; so a union broken with a
// leading `|`, or an object type with one member per line, is not read.
const TYPE_ANNOTATION_SOURCE = String.raw`(?::(?:[^=;\n]|[<,({\[|&][ \t\r]*\n|\n(?=[ \t]*[>)}\]]))*)?`

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

// What follows an import statement on its line: whatever run of comments
// comes after it (captured, and put back on the rewritten statement — a
// block comment may run onto later lines), and then the line's newline when
// nothing else is on the line — one newline only, so a rewritten import
// keeps the blank line after it, and a deleted duplicate leaves no stray `;`
// line behind in semicolon-using projects. The statement ends at the first
// character that is not a comment, so a second statement on the same line
// stays where it is.
const ADDON_IMPORT_TAIL_SOURCE = String.raw`((?:[ \t]*(?:\/\/[^\r\n]*|\/\*[\s\S]*?\*\/))*)[ \t]*(?:\r?\n|$)?`

// Match a whole named-import statement from the addon package — with or
// without a default binding before the list (`import dp, { … } from …`) —
// up to any trailing semicolon, then its tail. The name list is `[^}]*`
// rather than `[\s\S]*?`: a lazy any-character group can start at an earlier
// `import {` from another package and run on until it reaches the addon's
// `} from …`, swallowing every import in between. Run on text with comments
// blanked, so a `}` inside a comment in the list cannot end it early; the `d`
// flag gives the tail's position, where the comments are read back from the
// file — so the space before the tail is only taken when a `;` follows it,
// or the tail would start past a blanked comment.
const ADDON_IMPORT_REGEX = new RegExp(
	String.raw`^[\t ]*import\s*(type\s+)?(?:([A-Za-z_$][\w$]*)\s*,\s*)?\{([^}]*)\}\s*from\s*['"]storybook-addon-dependency-previews['"](?:[ \t]*;)?` +
		ADDON_IMPORT_TAIL_SOURCE,
	'gmd',
)

/** One named-import statement from the addon package, as found in the file. */
interface AddonImportStatement {
	/** Position of the statement's first character. */
	index: number
	/** Length of the statement, its trailing comments and its line's newline. */
	length: number
	/** Whether it is an `import type { … }`. */
	isTypeOnly: boolean
	/** The default binding before the list (`dp` in `import dp, { … }`), if any. */
	defaultBinding: string | null
	/** The text between its braces, comments blanked. */
	namesList: string
	/** The comments after it on its line, as written, or `''`. */
	trailingComments: string
}

/** One name in an addon import's `{ … }` list. */
type AddonImportEntry = { name: string; alias?: string; isType: boolean }

/**
 * What the import matchers blank: template literals, where a multi-line
 * code sample would put an `import` at a line start, but not `'…'` / `"…"`
 * strings, whose contents are the package names the matchers read.
 */
const TEMPLATE_QUOTE_ONLY: ReadonlyArray<string> = ['`']

/**
 * Every named import from the addon package in the file: the statements as
 * matched (each with its `index` into the file), and their names merged into
 * one list — one entry per name, a value entry winning over a type-only one
 * (a value can be used in type positions, not the other way round). The list
 * is what a merged statement is written from, and what the local name of any
 * addon export is read from, so the two cannot disagree.
 *
 * Statements are found on the text with comments and template-literal
 * contents blanked, so neither a commented-out import nor a code sample in a
 * template literal is taken for a live one, and a `}` inside a comment in
 * the name list cannot end the list early. The blanked text keeps every
 * position, so the statement's own trailing comments are then read from the
 * file at the position the match gives for its tail.
 *
 * @param content - the file content
 */
function parseAddonImports(content: string): {
	statements: Array<AddonImportStatement>
	entries: Array<AddonImportEntry>
} {
	const codeOnly = stripCommentsRespectingStrings(content)
	const stripped = blankStringContents(codeOnly, TEMPLATE_QUOTE_ONLY)
	const statements: Array<AddonImportStatement> = []
	for (const strippedMatch of stripped.matchAll(ADDON_IMPORT_REGEX)) {
		const index = strippedMatch.index!
		const tailStart = strippedMatch.indices![4]![0]
		const tailInFile = new RegExp(ADDON_IMPORT_TAIL_SOURCE, 'y')
		tailInFile.lastIndex = tailStart
		// The tail can be empty, so this always matches.
		const tail = tailInFile.exec(content)!
		statements.push({
			index,
			length: tailStart - index + tail[0].length,
			isTypeOnly: !!strippedMatch[1],
			defaultBinding: strippedMatch[2] ?? null,
			namesList: strippedMatch[3]!,
			trailingComments: tail[1]!.trim(),
		})
	}
	const parseEntry = (raw: string, wasTypeOnly: boolean): AddonImportEntry => {
		// `import type { A, B }` makes every name a type, so respect that.
		const isType = wasTypeOnly || /^type\s+/.test(raw)
		const stripped = raw.replace(/^type\s+/, '')
		const [name, alias] = stripped.split(/\s+as\s+/).map((s) => s.trim())
		return { name: name!, alias, isType }
	}
	const byName = new Map<string, AddonImportEntry>()
	for (const statement of statements) {
		for (const raw of statement.namesList
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)) {
			const entry = parseEntry(raw, statement.isTypeOnly)
			const prev = byName.get(entry.name)
			if (!prev || (prev.isType && !entry.isType)) byName.set(entry.name, entry)
		}
	}
	return { statements, entries: Array.from(byName.values()) }
}

/**
 * Collapse a run of three or more line breaks around `position` — the gap a
 * deleted statement leaves between the blank lines that surrounded it — to
 * one blank line. Only that run is touched, so a longer run elsewhere in the
 * file (inside a template literal, say) is left as written.
 *
 * @param content - the file content
 * @param position - a position inside or at either end of the run
 * @param eol - the file's line ending
 */
function collapseBlankLinesAt(
	content: string,
	position: number,
	eol: string,
): string {
	const isLineBreakChar = (c: string | undefined) => c === '\n' || c === '\r'
	let runStart = position
	while (runStart > 0 && isLineBreakChar(content[runStart - 1])) runStart--
	let runEnd = position
	while (runEnd < content.length && isLineBreakChar(content[runEnd])) runEnd++
	const run = content.slice(runStart, runEnd)
	const lineBreakCount = run.split('\n').length - 1
	const maxKeptLineBreaks = 2
	if (lineBreakCount <= maxKeptLineBreaks) return content
	return content.slice(0, runStart) + eol + eol + content.slice(runEnd)
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
	const { statements: allAddonImports, entries: dedupedExisting } =
		parseAddonImports(content)
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

	const formatEntry = (e: AddonImportEntry): string => {
		const inner = e.alias ? `${e.name} as ${e.alias}` : e.name
		return e.isType ? `type ${inner}` : inner
	}

	const requiredValueSet = new Set(requiredValueNames)

	// Promote any existing entry whose name matches a required value to a value
	// import. This handles e.g. `import type { defaultPreviewParameters } from ...` —
	// without promotion we'd leave it as a type and the runtime spread would fail.
	const mergedEntries: Array<AddonImportEntry> = dedupedExisting.map((e) =>
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
		// replacement; also tack on the project's semicolon style, and the
		// trailing comment the replaced statement carried, if any. A default
		// binding one of the statements carried (`import dp, { … }`) stays on
		// the merged one.
		const defaultBinding =
			allAddonImports.find((s) => s.defaultBinding)?.defaultBinding ?? null
		const defaultClause = defaultBinding ? `${defaultBinding}, ` : ''
		const mergedStatement = `import ${defaultClause}{${eol}${mergedEntries
			.map((e) => `${indent}${formatEntry(e)},`)
			.join(eol)}${eol}} from ${quote}${PKG}${quote}${trailingSemi}`
		// Replace the first import with the merged version; delete the rest.
		// Spliced by position, last statement first so earlier positions stay
		// valid — a regex replace over the file would also hit a commented-out
		// import, which the parse deliberately skipped.
		const [firstStatement, ...otherStatements] = allAddonImports
		for (const statement of [...otherStatements].reverse()) {
			const deletedFrom = statement.index
			newContent =
				newContent.slice(0, deletedFrom) +
				newContent.slice(deletedFrom + statement.length)
			newContent = collapseBlankLinesAt(newContent, deletedFrom, eol)
		}
		const { trailingComments } = firstStatement!
		const commentSuffix = trailingComments === '' ? '' : ` ${trailingComments}`
		newContent =
			newContent.slice(0, firstStatement!.index) +
			`${mergedStatement}${commentSuffix}${eol}` +
			newContent.slice(firstStatement!.index + firstStatement!.length)
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
	// Line-start anchor against a single-line string sample; template-literal
	// contents blanked against a multi-line one.
	const withoutTemplates = blankStringContents(codeOnly, TEMPLATE_QUOTE_ONLY)
	const hasDependenciesJsonImport =
		/^[\t ]*import\s+dependenciesJson\s+from\s*['"]\.\/dependency-previews\.json['"]/m.test(
			withoutTemplates,
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
 * comment-stripped, string-blanked twin, whose positions line up with it)
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
	// Comments and string contents blanked, positions kept: a code sample
	// held in a string cannot pass for the config.
	const codeOnly = stripCommentsRespectingStrings(text)
	const stripped = blankStringContents(codeOnly)

	// Direct patterns: typed preview (`Preview = {`, `StorybookPreviewConfig = {`)
	// or anonymous default export (`export default {`).
	const directMatch = stripped.match(
		/(StorybookPreviewConfig\s*=\s*\{|Preview\s*=\s*\{|export\s+default\s*\{)/,
	)
	const direct = objectBodyAfterMatch(text, directMatch)
	if (direct) return direct

	// Fallback: untyped `const preview = { … }; export default preview` (common
	// in `.js` / `.jsx` preview files where there's no type annotation).
	// Resolve `export default <ident>` to its `(const|let|var) <ident> = {…}`
	// declaration and use that object's body.
	const exportIdent = stripped.match(
		/export\s+default\s+([A-Za-z_$][\w$]*)\b/,
	)?.[1]
	if (!exportIdent) return null
	const escaped = escapeForRegex(exportIdent)
	const declarationMatch = stripped.match(
		new RegExp(`(?:const|let|var)\\s+${escaped}\\s*=\\s*\\{`),
	)
	return objectBodyAfterMatch(text, declarationMatch)
}

/**
 * Locate the body of the object passed to `definePreview({ … })` in a CSF
 * Next preview file — the style Storybook 11 makes the default. Only the
 * default export counts — `export default definePreview(…)` directly, or
 * `export default <name>` resolved to its `const <name> = definePreview(…)`
 * declaration — so a stray `definePreview` call elsewhere in the file is not
 * mistaken for the config. Either way the call's argument is then read the
 * same: a `{ … }` literal is the body; an identifier is resolved to its
 * `const <name> = {` declaration. Runs on the comment-stripped text like
 * `findPreviewBody`, so a `definePreview` that only appears in a comment is
 * ignored. `null` when the file is not in this style, or the argument is
 * something else (an import, a call), or the binding holding the call or
 * the config is a `let` assigned to again (`checkIsAssignedAfter`).
 *
 * @param text - the file content
 */
function findDefinePreviewBody(
	text: string,
): { from: number; to: number } | null {
	// Comments and string contents blanked, positions kept: a code sample
	// held in a string cannot pass for the config.
	const codeOnly = stripCommentsRespectingStrings(text)
	const stripped = blankStringContents(codeOnly)

	const call = findDefaultExportDefinePreviewArgument(stripped)
	// A reassigned binding exports some later call, which is not read.
	if (call === null || call.isBindingReassigned) return null
	const { argumentStart } = call

	if (stripped[argumentStart] === '{') {
		const closeIdx = findMatchingBrace(stripped, argumentStart)
		return closeIdx === null ? null : { from: argumentStart + 1, to: closeIdx }
	}

	// `(?:as\s+[^,)]+)?` allows a cast on the argument, `,?` a trailing comma.
	const configArgument = new RegExp(
		String.raw`([A-Za-z_$][\w$]*)\s*(?:as\s+[^,)]+)?\s*,?\s*\)`,
		'y',
	)
	configArgument.lastIndex = argumentStart
	const configIdent = configArgument.exec(stripped)?.[1]
	if (!configIdent) return null
	const views: CodeViews = { codeOnly, structureOnly: stripped }
	const configRange = findInitializerLiteralRange(views, configIdent)
	// The initializer has to be an object; `definePreview([…])` is no config.
	const isObjectLiteral =
		configRange !== null && stripped[configRange.from - 1] === '{'
	return isObjectLiteral ? configRange : null
}

/**
 * The file's default-exported `definePreview(…)` call — written directly, or
 * through a `const <name> = definePreview(…)` (with a type annotation on the
 * const, as `TYPE_ANNOTATION_SOURCE` reads one) that `export default <name>`
 * names — as the position of its argument's first character, and whether
 * that binding is assigned to again later (a `let preview` given a second
 * `definePreview(…)` before the export exports the second, which is not
 * read). `null` when the default export is not such a call.
 *
 * @param structureOnly - the file with comments stripped and strings blanked
 */
function findDefaultExportDefinePreviewArgument(
	structureOnly: string,
): { argumentStart: number; isBindingReassigned: boolean } | null {
	const directCall = structureOnly.match(
		/export\s+default\s+definePreview\s*\(\s*/,
	)
	if (directCall?.index !== undefined) {
		const argumentStart = directCall.index + directCall[0].length
		return { argumentStart, isBindingReassigned: false }
	}
	const exportIdent = structureOnly.match(
		/export\s+default\s+([A-Za-z_$][\w$]*)\b/,
	)?.[1]
	if (!exportIdent) return null
	const declaredCall = findTopLevelDeclaration(
		structureOnly,
		exportIdent,
		String.raw`definePreview\s*\(\s*`,
	)
	if (!declaredCall) return null
	const argumentStart = declaredCall.valueStart
	const isBindingReassigned = checkIsAssignedAfter({
		structureOnly,
		declarationKeyword: declaredCall.keyword,
		name: exportIdent,
		position: argumentStart,
	})
	return { argumentStart, isBindingReassigned }
}

/** The keyword a binding is declared with. */
type DeclarationKeyword = 'const' | 'let' | 'var'

/** A `const` / `let` / `var` declaration found at the module's top level. */
interface TopLevelDeclaration {
	keyword: DeclarationKeyword
	/** Position just after the `=` and the whitespace following it. */
	valueStart: number
}

/**
 * The first `const` / `let` / `var` declaration of `name` at the module's
 * top level whose initializer starts with `initializerStart`, or `null`
 * when there is none. Top level is read as "starts its line" — the keyword,
 * or an `export` before it, at the first column, which is how every
 * formatter writes one — so a same-named binding inside a helper's body (a
 * decorator's local `config`), indented as a formatter indents it, is
 * passed over and not taken for the exported one. Counting the brackets
 * open before the match would answer the same question, but a bracket the
 * scanners cannot pair somewhere above the config (a lone `)` in JSX text,
 * say) would then hide every declaration below it; a line start cannot be
 * hidden that way. A type annotation on the declaration is allowed
 * (`TYPE_ANNOTATION_SOURCE`).
 *
 * @param structureOnly - the file with comments stripped and strings blanked
 * @param name - the binding
 * @param initializerStart - regex source the initializer has to begin with
 *   (`''` for any initializer)
 */
function findTopLevelDeclaration(
	structureOnly: string,
	name: string,
	initializerStart: string,
): TopLevelDeclaration | null {
	const declaration = structureOnly.match(
		new RegExp(
			String.raw`^(?:export\s+)?(const|let|var)\s+${escapeForRegex(name)}\s*${TYPE_ANNOTATION_SOURCE}=\s*${initializerStart}`,
			'm',
		),
	)
	if (!declaration || declaration.index === undefined) return null
	return {
		keyword: declaration[1] as DeclarationKeyword,
		valueStart: declaration.index + declaration[0].length,
	}
}

interface CheckIsAssignedAfterParams {
	/** The file with comments stripped and strings blanked. */
	structureOnly: string
	/** The keyword the binding was declared with. */
	declarationKeyword: DeclarationKeyword
	/** The binding. */
	name: string
	/** Where to start looking — just after the declaration's `=`. */
	position: number
}

/**
 * Whether a `let` or `var` binding is assigned to again after `position` — a
 * statement starting `<name> =` (or `<name> +=` and the like) at a line
 * start, or after a `;`, a `)` (`if (x) name = …`), a block's `{` or `}`, an
 * `else`, a `=>`, or a `(` (an assignment used as a value, which a formatter
 * wraps: `=> (name = …)`, `return (name = …)`). Such a binding initialised
 * with a literal and then reassigned runs with the later value, so the
 * literal must not be read as its value. A `const` cannot be reassigned, so
 * it is never checked: a `<name> =` at a line start after one is something
 * else that shares the name — a JSX attribute, a default parameter — and
 * must not count. An arrow parameter of that name (`items.map(name => …)`)
 * is never counted, since the `=` of `=>` is not an assignment. (A default
 * parameter, or a JSX attribute on its own line, on a `let`-named binding
 * does count, and refuses; that is accepted.)
 */
function checkIsAssignedAfter({
	structureOnly,
	declarationKeyword,
	name,
	position,
}: CheckIsAssignedAfterParams): boolean {
	if (declarationKeyword === 'const') return false
	// A statement can also start after a `)` (`if (x) name = …`), a `{` or
	// `}` (a block), an `else`, or a `=>` (an arrow body) — and an assignment
	// used as a value sits after a `(`, which is how a formatter wraps it.
	const assignment = new RegExp(
		String.raw`(?:^|[;)}{(]|\belse|=>)[ \t]*${escapeForRegex(name)}\s*(?:\*\*|[-+*/%&|^]|<<|>>>?|&&|\|\||\?\?)?=(?![=>])`,
		'm',
	)
	return assignment.test(structureOnly.slice(position))
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
 * '…'` and `import { default as docs } from '…'`. `null` when the file has
 * no default import from that package.
 *
 * @param codeOnly - the file content with comments stripped
 * @param packageName - the package the import must come from
 */
function findDefaultImportLocalName(
	codeOnly: string,
	packageName: string,
): string | null {
	const escapedPackageName = escapeForRegex(packageName)
	const fromPackage = String.raw`\s*from\s*['"]${escapedPackageName}['"]`
	// Anchored to a line start so an import quoted inside a string on some
	// other line (a code sample) is not taken for a real one, and read with
	// template-literal contents blanked so a multi-line sample is not either.
	const withoutTemplates = blankStringContents(codeOnly, TEMPLATE_QUOTE_ONLY)
	const defaultBinding = withoutTemplates.match(
		new RegExp(
			String.raw`^[\t ]*import\s+(?!type\s)([A-Za-z_$][\w$]*)\s*(?:,\s*\{[^}]*\})?${fromPackage}`,
			'm',
		),
	)
	if (defaultBinding) return defaultBinding[1]!
	const defaultAsNamed = withoutTemplates.match(
		new RegExp(
			String.raw`^[\t ]*import\s*\{[^}]*\bdefault\s+as\s+([A-Za-z_$][\w$]*)[^}]*\}${fromPackage}`,
			'm',
		),
	)
	return defaultAsNamed?.[1] ?? null
}

/**
 * The local name a file gives one of the addon package's named exports —
 * `import { dependencyPreviews as dp } from '…'` gives `dp`, a plain
 * `import { dependencyPreviews }` gives `dependencyPreviews` — or `null`
 * when the file does not import it. Read from the same merged list
 * `mergeAddonImport` writes its statement from, so the name the body calls
 * is the name the import binds.
 *
 * @param content - the file content
 * @param exportedName - the named export to look for
 */
function findAddonNamedImportLocalName(
	content: string,
	exportedName: string,
): string | null {
	const entry = parseAddonImports(content).entries.find(
		(e) => e.name === exportedName,
	)
	if (!entry) return null
	return entry.alias ?? entry.name
}

/** How a file binds the addon's `dependencyPreviews` registration function. */
interface DependencyPreviewsBinding {
	/**
	 * The name a call the wizard inserts uses: the package's default import
	 * when the file has one, else the named import's local name (the export's
	 * own name when the file does not import it yet).
	 */
	nameToCall: string
	/**
	 * Every name the file imports it under — a default import and a named
	 * import can both be present; empty when it imports neither. A call of
	 * any of these registers it; a call of the export's own name in a file
	 * that does not import it is some other function.
	 */
	boundNames: Array<string>
	/**
	 * Whether `nameToCall` is the package's default import — one a named
	 * import must not be merged beside, since it would declare the name twice.
	 */
	isDefaultImport: boolean
}

/**
 * The local names a file gives `dependencyPreviews`. It is also the
 * package's default export, and the docs used to show it imported that way
 * — `import dependencyPreviews from '…'` — so a default import (possibly
 * with a named list after it) is preferred for a call the wizard inserts,
 * and the named import under any alias (`findAddonNamedImportLocalName`)
 * is read as well, since a file may carry both and call either.
 *
 * @param content - the file content
 * @param codeOnly - the same content with comments stripped
 */
function findDependencyPreviewsBinding(
	content: string,
	codeOnly: string,
): DependencyPreviewsBinding {
	const defaultImportLocal = findDefaultImportLocalName(codeOnly, PKG)
	const namedImportLocal = findAddonNamedImportLocalName(
		content,
		'dependencyPreviews',
	)
	// The export's own name is what a fresh named import binds.
	const nameToCall =
		defaultImportLocal ?? namedImportLocal ?? 'dependencyPreviews'
	const boundNames = [defaultImportLocal, namedImportLocal].filter(
		(name): name is string => name !== null,
	)
	return { nameToCall, boundNames, isDefaultImport: !!defaultImportLocal }
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
 * per line when the list starts with a line break, comma-and-space when the
 * first entry sits on the `[` line (after any space that follows the `[`),
 * and just the entries in an empty list.
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
	const isOneEntryPerLine = /^[ \t]*\r?\n/.test(listText)
	if (isOneEntryPerLine) {
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

interface LayOutSingleLineObjectParams {
	/** The file content. */
	content: string
	/** Position just after the object's `{`. */
	bodyStart: number
	/** Position of the object's `}`. */
	bodyEnd: number
	/** Indent for the line the existing entries move onto. */
	entryIndent: string
	/** Indent for the closing `}`. */
	closeIndent: string
	/** The file's formatting — only its line ending is used here. */
	style: PreviewFileStyle
}

/**
 * Lay an object whose body sits on one line (`{}`, `{ docs: … }`) out as a
 * multi-line object, so a key inserted after its `{` gets a line of its own
 * and the closing `}` does not end up glued to it. The existing text —
 * comments included — moves onto its own line as it was; a trailing comma is
 * added only when the line ends in code that lacks one, never after a
 * comment. A body that already holds a line break is returned unchanged.
 */
function layOutSingleLineObject({
	content,
	bodyStart,
	bodyEnd,
	entryIndent,
	closeIndent,
	style,
}: LayOutSingleLineObjectParams): string {
	const { eol } = style
	const body = content.slice(bodyStart, bodyEnd)
	const isMultiLine = /\r?\n/.test(body)
	if (isMultiLine) return content
	const existingText = body.trim()
	const existingCode = stripCommentsRespectingStrings(body).trim()
	const doesEndWithComment = /(\/\/[^\r\n]*|\*\/)$/.test(existingText)
	const needsTrailingComma =
		existingCode !== '' && !existingCode.endsWith(',') && !doesEndWithComment
	const existingLine =
		existingText === ''
			? ''
			: `${eol}${entryIndent}${existingText}${needsTrailingComma ? ',' : ''}`
	const newBody = `${existingLine}${eol}${closeIndent}`
	return content.slice(0, bodyStart) + newBody + content.slice(bodyEnd)
}

interface CreateKeyInBodyParams {
	/** The file content. */
	content: string
	/** The range inside the braces of the object literal the key goes into. */
	body: { from: number; to: number }
	/**
	 * The key and value to write, as one entry ending in its comma, without
	 * the indent of its first line (later lines carry their own).
	 */
	entry: string
	/** The indent of the entry's first line — one level for a config key. */
	entryIndent: string
	/**
	 * Whether the entry has to run after the body's top-level spreads — at
	 * the end of the body rather than its start — so nothing spread in later
	 * overrides it.
	 */
	isAfterSpreads: boolean
	/** The file's formatting. */
	style: PreviewFileStyle
}

/**
 * Write a new key into an object literal: at the start of its body, or at
 * the end when the body spreads other objects (a comma is added after the
 * last existing entry when it has none, and the new key goes below any
 * comment on that entry's line). Returns the content and the offset just
 * after the entry, so a second created key can follow it.
 */
function createKeyInBody({
	content,
	body,
	entry,
	entryIndent,
	isAfterSpreads,
	style,
}: CreateKeyInBodyParams): { content: string; endOffset: number } {
	const { eol } = style
	if (!isAfterSpreads) {
		const insertion = `${eol}${entryIndent}${entry}`
		const insertAt = body.from
		return {
			content: content.slice(0, insertAt) + insertion + content.slice(insertAt),
			endOffset: insertAt + insertion.length,
		}
	}
	// Measured on the comment-stripped body, so a trailing comment on the
	// last entry is not what the comma lands after.
	const existingCode = stripCommentsRespectingStrings(
		content.slice(body.from, body.to),
	)
	const trimmedEnd = existingCode.trimEnd()
	const doesEndWithComma = trimmedEnd === '' || trimmedEnd.endsWith(',')
	const commaAt = body.from + trimmedEnd.length
	const comma = doesEndWithComma ? '' : ','
	const withComma = content.slice(0, commaAt) + comma + content.slice(commaAt)
	// A comment sharing the last entry's line stays on that line: the new
	// entry goes in after it, not between the entry and its comment.
	const sameLineComment = withComma
		.slice(commaAt + comma.length)
		.match(/^(?:[ \t]*(?:\/\/[^\r\n]*|\/\*(?:(?!\*\/)[^\r\n])*\*\/))*/)
	const insertAt = commaAt + comma.length + (sameLineComment?.[0].length ?? 0)
	const insertion = `${eol}${entryIndent}${entry}`
	return {
		content:
			withComma.slice(0, insertAt) + insertion + withComma.slice(insertAt),
		endOffset: insertAt + insertion.length,
	}
}

const ALREADY_CONFIGURED_REASON = 'addon already configured in preview'
const COULD_NOT_LOCATE_DEFINE_PREVIEW_REASON =
	'Could not locate the definePreview config object — please add `addonDocs()` and `dependencyPreviews()` to `addons` and the `dependencyPreviews` parameters manually.'

/**
 * Two views of one file with every position shared: `codeOnly` has comments
 * blanked and strings kept (what a key lookup and the returned code read,
 * so a quoted key like `"addons":` stays visible), `structureOnly` has string
 * contents blanked as well (what brace matching, spread scanning and
 * declaration searches read, so a code sample in a string cannot mislead
 * them).
 */
interface CodeViews {
	codeOnly: string
	structureOnly: string
}

interface GetValueCodeParams {
	views: CodeViews
	/** Position of the value's first character. */
	valueStart: number
	/** Identifiers already being resolved, so `const a = [...a]` cannot loop. */
	visited: Set<string>
}

/**
 * The code a value stands for, as one flat list of entries. A literal
 * `[ … ]` / `{ … }` gives its contents, followed by the contents of every
 * same-file `const` it spreads at its own level; a bare identifier
 * (`addons: shared`, or the shorthand `addons,`) gives its same-file
 * initializer the same way. Anything the file itself cannot account for — a
 * call, an import, a spread of an import — contributes nothing, so the
 * presence checks built on this never credit code they cannot see.
 */
function getValueCode({
	views,
	valueStart,
	visited,
}: GetValueCodeParams): string {
	const { codeOnly, structureOnly } = views
	const opener = structureOnly[valueStart]
	if (opener === '[' || opener === '{') {
		const end = findMatchingBrace(structureOnly, valueStart)
		if (end === null) return ''
		const contents = codeOnly.slice(valueStart + 1, end)
		const spreads = findSpreadsAtTopLevel(views, {
			from: valueStart + 1,
			to: end,
		})
		const spreadCodes = spreads.map((spread) =>
			spread.isPlainName
				? getInitializerCode({ views, name: spread.name, visited })
				: '',
		)
		return [contents, ...spreadCodes].join(',\n')
	}
	const identifier = structureOnly.slice(valueStart).match(/^[A-Za-z_$][\w$]*/)
	if (!identifier) return ''
	return getInitializerCode({ views, name: identifier[0], visited })
}

/**
 * The range inside the brackets of an identifier's same-file `const` / `let`
 * / `var` initializer, when that initializer is a literal `[ … ]` / `{ … }` —
 * `null` otherwise (no declaration at the module's top level, no
 * initializer, a call, an import, a `let` assigned to again —
 * `checkIsAssignedAfter`). The declaration is found by
 * `findTopLevelDeclaration`, which allows a type annotation.
 *
 * @param views - the file views
 * @param name - the identifier whose initializer is wanted
 */
function findInitializerLiteralRange(
	views: CodeViews,
	name: string,
): { from: number; to: number } | null {
	const declaration = findTopLevelDeclaration(views.structureOnly, name, '')
	if (!declaration) return null
	const { valueStart } = declaration
	// A binding written to again later holds something else by the time it
	// is used, so its initializer is not what runs.
	const isReassigned = checkIsAssignedAfter({
		structureOnly: views.structureOnly,
		declarationKeyword: declaration.keyword,
		name,
		position: valueStart,
	})
	if (isReassigned) return null
	const opener = views.structureOnly[valueStart]
	if (opener !== '[' && opener !== '{') return null
	const end = findMatchingBrace(views.structureOnly, valueStart)
	if (end === null) return null
	return { from: valueStart + 1, to: end }
}

interface GetInitializerCodeParams {
	views: CodeViews
	/** The identifier whose `const` / `let` / `var` initializer is wanted. */
	name: string
	/** Identifiers already being resolved, so `const a = [...a]` cannot loop. */
	visited: Set<string>
}

/**
 * The code of an identifier's same-file initializer, resolved like any other
 * value (`getValueCode`), or `''` when the file declares no literal for it.
 */
function getInitializerCode({
	views,
	name,
	visited,
}: GetInitializerCodeParams): string {
	if (visited.has(name)) return ''
	visited.add(name)
	const range = findInitializerLiteralRange(views, name)
	if (!range) return ''
	// `from` is just inside the bracket; the value starts at the bracket.
	return getValueCode({ views, valueStart: range.from - 1, visited })
}

const SPREAD_TOKEN = '...'

/** One `...` spread at the top level of a literal. */
interface TopLevelSpread {
	/**
	 * What is spread: the bare identifier (`shared`), or otherwise the whole
	 * expression as written (`shared.docs`, `getAddons()`, `(cond ? a : {})`)
	 * for naming it in a message.
	 */
	name: string
	/**
	 * Whether the spread is a bare identifier and nothing more. Anything else
	 * spreads something the file's declarations cannot account for, so it must
	 * not be credited with the whole of `shared`.
	 */
	isPlainName: boolean
	/** Position of the `...` in the file. */
	position: number
}

/**
 * The spreads at the top level of a literal's contents — `...shared` in
 * `[a(), ...shared]` or `{ ...shared, docs: {} }` — not those inside nested
 * literals, which belong to the nested value. Every `...` is recorded,
 * whatever follows it, so a spread of an expression is never invisible to a
 * caller deciding where a created key has to go.
 *
 * @param views - the file views
 * @param range - the range between the literal's brackets
 */
function findSpreadsAtTopLevel(
	views: CodeViews,
	range: { from: number; to: number },
): Array<TopLevelSpread> {
	const contents = views.structureOnly.slice(range.from, range.to)
	const spreads: Array<TopLevelSpread> = []
	let depth = 0
	for (let i = 0; i < contents.length; i++) {
		const c = contents[i]!
		depth += getBracketDepthChange(c)
		if (depth === 0 && contents.startsWith(SPREAD_TOKEN, i)) {
			// The operand runs to the next comma at this level, or to the end.
			const operandStart = i + SPREAD_TOKEN.length
			let operandEnd = operandStart
			let operandDepth = 0
			while (operandEnd < contents.length) {
				const oc = contents[operandEnd]!
				operandDepth += getBracketDepthChange(oc)
				if (oc === ',' && operandDepth === 0) break
				operandEnd++
			}
			const operandStructure = contents.slice(operandStart, operandEnd).trim()
			const isPlainName = /^[A-Za-z_$][\w$]*$/.test(operandStructure)
			// The structure view has string contents blanked, so the display
			// name of an expression is read from the code view.
			const name = isPlainName
				? operandStructure
				: views.codeOnly
						.slice(range.from + operandStart, range.from + operandEnd)
						.trim()
			spreads.push({ name, isPlainName, position: range.from + i })
			// The operand's brackets balanced, so the depth is unchanged.
			i = operandEnd - 1
		}
	}
	return spreads
}

/**
 * What a character does to the bracket depth of a scan: `1` for an opening
 * `{`, `[` or `(`, `-1` for the matching closers, `0` for anything else.
 *
 * @param c - the character being scanned
 */
function getBracketDepthChange(c: string): number {
	if (c === '{' || c === '[' || c === '(') return 1
	if (c === '}' || c === ']' || c === ')') return -1
	return 0
}

interface GetKeyValueCodeParams {
	views: CodeViews
	/** The key to look up. */
	keyword: string
	/** The range inside the braces of the object holding the key. */
	body: { from: number; to: number }
	/**
	 * Spreads already being walked into, so `const a = { ...a }` cannot loop.
	 * Left out at the top level.
	 */
	visited?: Set<string>
}

/**
 * Where a key's value comes from at runtime, and the code it stands for.
 * `body` — the config object's own key; `spread` — a same-file `const` the
 * body spreads at its top level (`definePreview({ ...base })` with
 * `base.addons`), or one reached through any chain of such consts;
 * `unreadable` — something spread at any depth that the file cannot see
 * inside (an import, a call, an expression), which may or may not carry the
 * key; `missing` — nothing in the body writes it.
 */
type KeyValueCode =
	| {
			location: 'body' | 'missing'
			/** `''` when the key is nowhere the file can account for. */
			code: string
	  }
	| {
			location: 'spread' | 'unreadable'
			/** `''` for `unreadable`: what the spread carries is not readable. */
			code: string
			/** The spread, as written after its `...`. */
			spreadName: string
	  }

/**
 * The code a key's value stands for (see `getValueCode`), scoped to one
 * object's body. The body's own key and its top-level spreads are all
 * writers of the key, and at runtime the last one in source order wins, so
 * they are walked last to first: a same-file spread that carries the key or
 * the body's own key is the value; a spread the file cannot read is reached
 * before either of those makes the value unknowable. A same-file spread's
 * literal is walked the same way, so a spread it carries in turn counts at
 * that level.
 */
function getKeyValueCode({
	views,
	keyword,
	body,
	visited = new Set(),
}: GetKeyValueCodeParams): KeyValueCode {
	const key = findTopLevelKey(views.codeOnly, keyword, body)
	const spreads = findSpreadsAtTopLevel(views, body)
	const spreadsAfterKey = key
		? spreads.filter((spread) => spread.position > key.valueStart)
		: spreads
	for (const spread of spreadsAfterKey.reverse()) {
		const isReadable = spread.isPlainName && !visited.has(spread.name)
		const range = isReadable
			? findInitializerLiteralRange(views, spread.name)
			: null
		if (!range) {
			return { code: '', location: 'unreadable', spreadName: spread.name }
		}
		const inSpread = getKeyValueCode({
			views,
			keyword,
			body: range,
			visited: new Set([...visited, spread.name]),
		})
		if (inSpread.location === 'body') {
			return {
				code: inSpread.code,
				location: 'spread',
				spreadName: spread.name,
			}
		}
		if (inSpread.location !== 'missing') return inSpread
	}
	if (key) {
		const code = getValueCode({
			views,
			valueStart: key.valueStart,
			visited: new Set(visited),
		})
		return { code, location: 'body' }
	}
	return { code: '', location: 'missing' }
}

/**
 * Whether a key's value, written in the body as an object literal, spreads
 * anything at its own top level (`parameters: { ...base }`) — so a key
 * created inside it has to go after the spread. `false` when the key is
 * absent or its value is not a `{ … }` literal.
 *
 * @param views - the file views
 * @param keyword - the key whose literal value is checked
 * @param body - the range inside the braces of the object holding the key
 */
function checkHasSpreadInLiteralValue(
	views: CodeViews,
	keyword: string,
	body: { from: number; to: number },
): boolean {
	const key = findTopLevelKey(views.codeOnly, keyword, body)
	if (!key || views.structureOnly[key.valueStart] !== '{') return false
	const end = findMatchingBrace(views.structureOnly, key.valueStart)
	if (end === null) return false
	const literal = { from: key.valueStart + 1, to: end }
	return findSpreadsAtTopLevel(views, literal).length > 0
}

/**
 * Whether the text holds the `dependencyPreviews:` settings key the wizard
 * writes into `parameters`, anywhere in it — the classic path's file-wide
 * marker. The CSF Next path asks the narrower `checkHasSettingsKeyAtTopLevel`
 * of the `parameters` value instead.
 *
 * @param codeOnly - text with comments stripped
 */
function checkHasSettingsBlock(codeOnly: string): boolean {
	return /\bdependencyPreviews\s*:/.test(codeOnly)
}

/**
 * Whether the `dependencyPreviews:` settings key sits at the top level of a
 * `parameters` value's code (from `getValueCode`) — a `dependencyPreviews`
 * nested deeper belongs to some other setting.
 *
 * @param parametersCode - the `parameters` value's code
 */
function checkHasSettingsKeyAtTopLevel(parametersCode: string): boolean {
	return findTopLevelKey(parametersCode, 'dependencyPreviews') !== null
}

/** The text of each entry at the top level of a list's contents, in order. */
function splitTopLevelEntries(listStructure: string): Array<string> {
	const entries: Array<string> = []
	let depth = 0
	let entryStart = 0
	for (let i = 0; i < listStructure.length; i++) {
		const c = listStructure[i]!
		depth += getBracketDepthChange(c)
		if (c === ',' && depth === 0) {
			entries.push(listStructure.slice(entryStart, i))
			entryStart = i + 1
		}
	}
	entries.push(listStructure.slice(entryStart))
	return entries
}

/**
 * Whether a `[ … ]` list has an entry that is a call of the given local name
 * — `addonDocs()` in an `addons` list, say. Only an entry of its own counts:
 * the same call nested inside another entry, or quoted in a string, does not
 * register anything.
 *
 * @param listCode - the text between the list's brackets, comments stripped
 * @param localName - the identifier the call must use
 */
function checkDoesListCall(listCode: string, localName: string): boolean {
	const isCallOfName = new RegExp(
		String.raw`^${escapeForRegex(localName)}\s*\(`,
	)
	const listStructure = blankStringContents(listCode)
	return splitTopLevelEntries(listStructure).some((entry) =>
		isCallOfName.test(entry.trim()),
	)
}

/**
 * Whether the given local name is called anywhere in the file — the
 * file-wide reading used only when the config object itself cannot be read.
 *
 * @param structureOnly - the file with comments stripped and strings blanked
 * @param localName - the identifier the call must use
 */
function checkDoesFileCall(structureOnly: string, localName: string): boolean {
	return new RegExp(String.raw`\b${escapeForRegex(localName)}\s*\(`).test(
		structureOnly,
	)
}

interface PatchDefinePreviewParams {
	/** The file being patched — written back at the end. */
	previewFile: PreviewFile
	/** The file's current content. */
	content: string
	/** `content` with comments stripped, and with strings blanked as well. */
	views: CodeViews
	/** The range inside the braces of the `definePreview({ … })` object in `content`. */
	body: { from: number; to: number }
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
	views,
	body,
	style,
	framework,
	sourceRootUrl,
	srcDir,
}: PatchDefinePreviewParams): PreviewPatchResult {
	const { codeOnly } = views
	const { indent, eol, quote, trailingSemi } = style
	const l1 = indent
	const l2 = indent.repeat(2)

	// ─── Local names. The body edits come first and the imports last, so an
	// import is only ever added for something the edits actually inserted.
	const dependencyPreviewsBinding = findDependencyPreviewsBinding(
		content,
		codeOnly,
	)
	const dependencyPreviewsLocal = dependencyPreviewsBinding.nameToCall
	// The docs addon may already be registered under any local name
	// (`import docs from '@storybook/addon-docs'`); when it is, that name is
	// what the `addons` scan below looks for.
	const docsImportLocal = findDefaultImportLocalName(
		codeOnly,
		'@storybook/addon-docs',
	)
	const addonDocsLocal = docsImportLocal ?? 'addonDocs'

	// ─── Already configured? Both halves have to be there: the `addons` half
	// — `dependencyPreviews()` and, since a CSF Next `addons` list is what
	// loads each addon's preview-side setup, `addonDocs()` with it — and the
	// settings block, which alone (a classic file migrated by hand, say) does
	// not register anything. Each key's value is read as the code it stands
	// for (`getValueCode`): a literal's contents, plus the same-file `const`
	// a spread or a bare identifier points at — so a half that sits in a value
	// the patcher cannot edit still counts as present, while a value the file
	// cannot account for (a call, an import) counts as holding nothing.
	const addonsValue = getKeyValueCode({ views, keyword: 'addons', body })
	const parametersValue = getKeyValueCode({
		views,
		keyword: 'parameters',
		body,
	})
	// A call under any name the file binds it to counts (`import legacy, {
	// dependencyPreviews as dp }` with `dp()` in the list).
	const isDependencyPreviewsInList = dependencyPreviewsBinding.boundNames.some(
		(name) => checkDoesListCall(addonsValue.code, name),
	)
	const isAddonDocsInList = checkDoesListCall(addonsValue.code, addonDocsLocal)
	const isRegisteredInAddons = isDependencyPreviewsInList && isAddonDocsInList
	const hasSettingsBlock = checkHasSettingsKeyAtTopLevel(parametersValue.code)
	if (isRegisteredInAddons && hasSettingsBlock) {
		return { kind: 'skipped', reason: ALREADY_CONFIGURED_REASON }
	}
	// Each key is handled by where its runtime value comes from
	// (`getKeyValueCode`): the body's own key is edited in place; a key a
	// same-file spread carries is left alone when complete and not overridden
	// with a second key when short; a spread the file cannot see inside, which
	// may carry the key, stops the run with the manual message; and a key
	// nobody writes is created after the body's spreads, so that it runs.
	const hasBodySpread = findSpreadsAtTopLevel(views, body).length > 0
	const hasParametersSpread = checkHasSpreadInLiteralValue(
		views,
		'parameters',
		body,
	)
	const spreadRefusal = (
		keyword: string,
		value: Extract<KeyValueCode, { spreadName: string }>,
	): PreviewPatchResult => {
		const source =
			value.location === 'spread'
				? `takes \`${keyword}\` from \`...${value.spreadName}\`, which the wizard does not edit`
				: `may take \`${keyword}\` from \`...${value.spreadName}\`, which the wizard cannot read`
		return {
			kind: 'failed',
			reason: `Preview config ${source} — please add \`addonDocs()\` and \`dependencyPreviews()\` to \`addons\` and the \`dependencyPreviews\` parameters manually.`,
		}
	}
	// What the body edits inserted — decides the imports at the end, and
	// whether anything is written at all (nothing inserted means every half
	// was already present, in a literal or a non-literal value).
	const inserted = {
		dependencyPreviewsCall: false,
		addonDocsCall: false,
		settingsBlock: false,
	}

	// A body on one line (`definePreview({})`, `definePreview({ parameters: {} })`)
	// is laid out as a multi-line object first, so the keys added below each
	// get a line of their own and the closing brace is not glued to them.
	let newContent = layOutSingleLineObject({
		content,
		bodyStart: body.from,
		bodyEnd: body.to,
		entryIndent: l1,
		closeIndent: '',
		style,
	})
	const bodyRange = findDefinePreviewBody(newContent) ?? body

	// ─── `addons`: make sure both registrations are in the list.
	// If we create the key, remember where it ends so a created `parameters:`
	// lands after it rather than at the same body-start position.
	let addonsCreatedEndOffset: number | null = null
	const addonsKey = findTopLevelKey(newContent, 'addons', bodyRange)
	const isAddonsFromSpread =
		addonsValue.location === 'spread' || addonsValue.location === 'unreadable'
	if (isAddonsFromSpread) {
		// A spread after the body's own key (if any) decides the value: complete
		// in a same-file spread, nothing to do; short there, or unreadable, the
		// wizard will not write a list that does not run.
		if (!isRegisteredInAddons) {
			return spreadRefusal('addons', addonsValue)
		}
	} else if (addonsKey && newContent[addonsKey.valueStart] === '[') {
		const listStart = addonsKey.valueStart + 1
		const listEnd =
			findMatchingBrace(newContent, addonsKey.valueStart) ?? listStart
		// The list is the one the presence checks above already read (the
		// layout pass only moved it), so their answers decide what is missing.
		inserted.addonDocsCall = !isAddonDocsInList
		inserted.dependencyPreviewsCall = !isDependencyPreviewsInList
		const missingEntries = [
			...(inserted.addonDocsCall ? [`${addonDocsLocal}()`] : []),
			...(inserted.dependencyPreviewsCall
				? [`${dependencyPreviewsLocal}()`]
				: []),
		]
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
		// A list the patcher cannot edit: fine when the value it stands for
		// already holds both registrations (a same-file `const addons = [...]`),
		// refused otherwise.
		if (!isRegisteredInAddons) {
			return {
				kind: 'failed',
				reason:
					'Preview config defines `addons` in a non-literal-array form — please add `addonDocs()` and `dependencyPreviews()` to it manually.',
			}
		}
	} else {
		const created = createKeyInBody({
			content: newContent,
			body: bodyRange,
			entry: `addons: [${addonDocsLocal}(), ${dependencyPreviewsLocal}()],`,
			entryIndent: l1,
			isAfterSpreads: hasBodySpread,
			style,
		})
		newContent = created.content
		addonsCreatedEndOffset = created.endOffset
		inserted.addonDocsCall = true
		inserted.dependencyPreviewsCall = true
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
	const isParametersFromSpread =
		parametersValue.location === 'spread' ||
		parametersValue.location === 'unreadable'
	if (isParametersFromSpread) {
		if (!hasSettingsBlock) {
			return spreadRefusal('parameters', parametersValue)
		}
	} else if (paramsKey && newContent[paramsKey.valueStart] === '{') {
		// Nothing to do when the block is already there — only `addons` needed
		// the edit.
		if (!hasSettingsBlock) {
			const paramsStart = paramsKey.valueStart + 1
			const paramsEnd =
				findMatchingBrace(newContent, paramsKey.valueStart) ?? paramsStart
			// `parameters: {}` or `parameters: { docs: … }` on one line is laid
			// out as a multi-line object first, or the block's last `},` and the
			// old entries or closing `}` would share a line.
			newContent = layOutSingleLineObject({
				content: newContent,
				bodyStart: paramsStart,
				bodyEnd: paramsEnd,
				entryIndent: l2,
				closeIndent: l1,
				style,
			})
			// The same care as for the config body, one level down: a spread
			// inside `parameters` could carry the settings key, so the block goes
			// after any spread there. The literal only moved in the layout pass,
			// so the spreads read from the original views still describe it.
			const paramsEndAfterLayout =
				findMatchingBrace(newContent, paramsKey.valueStart) ?? paramsStart
			const created = createKeyInBody({
				content: newContent,
				body: { from: paramsStart, to: paramsEndAfterLayout },
				entry: block.slice(l2.length),
				entryIndent: l2,
				isAfterSpreads: hasParametersSpread,
				style,
			})
			newContent = created.content
			inserted.settingsBlock = true
		}
	} else if (paramsKey) {
		// An object the patcher cannot edit: fine when the value it stands for
		// already holds the block (a same-file `const parameters = { … }`),
		// refused otherwise.
		if (!hasSettingsBlock) {
			return {
				kind: 'failed',
				reason:
					'Preview config already defines `parameters` in a non-literal-object form — please manually add the `dependencyPreviews` block to the existing parameters definition.',
			}
		}
	} else if (addonsCreatedEndOffset !== null) {
		// Straight after the `addons:` created above, wherever that landed.
		const insertAt = addonsCreatedEndOffset
		const insertion = `${eol}${l1}parameters: {${eol}${block}${eol}${l1}},`
		newContent =
			newContent.slice(0, insertAt) + insertion + newContent.slice(insertAt)
		inserted.settingsBlock = true
	} else {
		const created = createKeyInBody({
			content: newContent,
			body: bodyRangeAfterAddons,
			entry: `parameters: {${eol}${block}${eol}${l1}},`,
			entryIndent: l1,
			isAfterSpreads: hasBodySpread,
			style,
		})
		newContent = created.content
		inserted.settingsBlock = true
	}

	const didInsertAnything =
		inserted.dependencyPreviewsCall ||
		inserted.addonDocsCall ||
		inserted.settingsBlock
	if (!didInsertAnything) {
		return { kind: 'skipped', reason: ALREADY_CONFIGURED_REASON }
	}

	// ─── Imports, for what was inserted. The import edits all sit above the
	// body, so they come last and shift nothing the edits above relied on.
	const importsToInsert: string[] = []
	const shouldAddDependencyPreviewsImport =
		inserted.dependencyPreviewsCall &&
		!dependencyPreviewsBinding.isDefaultImport
	if (shouldAddDependencyPreviewsImport) {
		const merged = mergeAddonImport({
			content: newContent,
			requiredValueNames: ['dependencyPreviews'],
			requiredTypeNames: [],
			style,
		})
		newContent = merged.content
		if (merged.importToInsert) importsToInsert.push(merged.importToInsert)
	}
	if (inserted.addonDocsCall && !docsImportLocal) {
		importsToInsert.push(
			`import addonDocs from ${quote}@storybook/addon-docs${quote}${trailingSemi}`,
		)
	}
	if (inserted.settingsBlock) {
		const dependenciesJsonImport = dependenciesJsonImportToInsert(
			codeOnly,
			style,
		)
		if (dependenciesJsonImport) importsToInsert.push(dependenciesJsonImport)
	}
	newContent = insertImports({
		content: newContent,
		statements: importsToInsert,
		eol,
	})

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

	// A CSF Next `export default definePreview({ … })` file is registered
	// through `dependencyPreviews()` rather than the classic spreads, and has
	// its own already-configured check — there the settings key says nothing
	// about whether `dependencyPreviews()` is in `addons`.
	const csfNextBody = findDefinePreviewBody(content)
	const isCsfNext = csfNextBody !== null
	// A default-exported `definePreview(…)` whose config the finder could not
	// resolve (an imported object, a call — exported directly or through a
	// const — or a `let` assigned to again) is still a CSF Next file, so the
	// advice has to name that style's additions rather than the classic
	// spreads. A call that is not the default export leaves a classic file
	// classic.
	const views: CodeViews = {
		codeOnly,
		structureOnly: blankStringContents(codeOnly),
	}
	const isUnresolvedDefinePreview =
		!isCsfNext &&
		findDefaultExportDefinePreviewArgument(views.structureOnly) !== null
	if (isUnresolvedDefinePreview) {
		// A hand-configured file the finder cannot read is not refused on every
		// run: when the file carries both registrations somewhere — the call
		// under whatever name the file imports it as — it is reported as
		// configured, with the caveat that, unread, the config is only presumed
		// to hold them.
		const { boundNames } = findDependencyPreviewsBinding(content, codeOnly)
		const isCalledSomewhere = boundNames.some((name) =>
			checkDoesFileCall(views.structureOnly, name),
		)
		const doesCarryBothHalves =
			isCalledSomewhere && checkHasSettingsBlock(codeOnly)
		if (doesCarryBothHalves) {
			return {
				kind: 'skipped',
				reason:
					'addon appears already configured in preview (the definePreview config could not be read — check that `addonDocs()` and `dependencyPreviews()` are in its `addons`)',
			}
		}
		return { kind: 'failed', reason: COULD_NOT_LOCATE_DEFINE_PREVIEW_REASON }
	}

	// `dependencyPreviews:` is the unique parameters key the wizard injects, so its
	// presence means the addon is already wired in — the classic path writes it
	// and the decorators spread together. Other markers like the bare
	// `dependencyPreviewDecorators` identifier are too lenient — they'd false-positive
	// on `import { dependencyPreviewDecorators as dpd } …` where the name appears in
	// the import declaration but isn't actually used in any decorators array yet.
	// Checked before the CommonJS test, so a hand-configured CommonJS preview is
	// still reported as configured rather than refused.
	if (!isCsfNext && checkHasSettingsBlock(codeOnly)) {
		return { kind: 'skipped', reason: ALREADY_CONFIGURED_REASON }
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

	if (csfNextBody) {
		return patchDefinePreview({
			previewFile,
			content,
			views,
			body: csfNextBody,
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
			String.raw`\.\.\.${escapeForRegex(defaultsLocalName)}\b`,
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
			String.raw`\.\.\.${escapeForRegex(decoratorsLocalName)}\b`,
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
