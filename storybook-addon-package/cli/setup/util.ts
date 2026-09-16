import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

/** The three characters that can open a string or template literal. */
const QUOTE_CHARS: ReadonlyArray<string> = ["'", '"', '`']

/**
 * Keywords an expression can directly follow — a regex literal (`return /x/`)
 * or a string (`return'x'`, `case'a':`) — so a `/` or a quote straight after
 * one of them is an opener, where the same character straight after any
 * other word is not.
 */
const EXPRESSION_PRECEDING_KEYWORDS =
	/(?:^|[^\w$])(?:return|typeof|case|do|else|in|of|instanceof|new|delete|void|throw|yield|await)$/

/** The longest keyword in `EXPRESSION_PRECEDING_KEYWORDS`. */
const LONGEST_EXPRESSION_PRECEDING_KEYWORD_LENGTH = 'instanceof'.length

/**
 * Whether the text ending at `endIndex` (inclusive) is a word — an
 * identifier, a number — that is not one of the keywords an expression can
 * directly follow. A quote or `/` straight after such a word cannot open a
 * string or a regex literal (`don't`, `it's`, `a/b`).
 *
 * @param text - the text being scanned
 * @param endIndex - position of the word's last character
 */
function checkIsEndOfNonKeywordWord(text: string, endIndex: number): boolean {
	if (endIndex < 0 || !/[\w$]/.test(text[endIndex]!)) return false
	const tailStart = endIndex - LONGEST_EXPRESSION_PRECEDING_KEYWORD_LENGTH
	const tail = text.slice(Math.max(0, tailStart), endIndex + 1)
	return !EXPRESSION_PRECEDING_KEYWORDS.test(tail)
}

/**
 * Detect the file's leading indent unit (one level deep) — first indented line
 * wins. Defaults to a tab so a file with no existing indent doesn't end up
 * un-indented.
 */
export function detectFileIndent(content: string): string {
	const m = content.match(/^([ \t]+)\S/m)
	return m ? m[1]! : '\t'
}

/** Detect the file's line-ending style. CRLF if any CRLF is present, else LF. */
export function detectEol(content: string): string {
	return content.includes('\r\n') ? '\r\n' : '\n'
}

/**
 * Detect the project's preferred string-literal quote style by counting the
 * opening quote of every complete `'…'` and `"…"` literal in the file, and
 * returning whichever quote appeared on more of them. Ties (including a file
 * with zero string literals) default to single quotes — both because Prettier
 * defaults to single and because the bulk of the JS/TS ecosystem leans single.
 *
 * Why majority-count rather than "first import": some scaffolders (notably
 * Storybook init for `@storybook/vue3-vite`) emit a mixed-style `main.ts`
 * where the leading `import` uses one quote style and the object literal
 * underneath uses the other. The first-import heuristic picks the wrong
 * answer for the body in that case and the wizard's inserted addon entry
 * ends up visually inconsistent with the surrounding array. Majority across
 * the whole file matches whichever style the body actually uses.
 *
 * Operates on the comment-stripped (but string-preserving) content so a
 * commented-out example doesn't skew the count, and steps over each string
 * whole with the shared `findClosingQuote` rule so quote characters that
 * appear *inside* the other quote's string literal, in a regex literal, or
 * alone in JSX text don't get counted.
 *
 * **Known limitation — template-literal expressions are opaque.** A
 * backtick string is treated as a single span until the closing backtick,
 * so any `'…'` / `"…"` literals that appear inside `${ … }` interpolation
 * expressions are not counted toward the tally. In practice this is fine
 * for the wizard's actual targets — `.storybook/main.{ts,js}` and
 * `.storybook/preview.{ts,tsx,js,jsx}` files in storybook-init scaffolds
 * are dominated by plain string literals, not template expressions — but
 * a file that relies heavily on interpolated strings of one quote style
 * could in theory be misclassified. Fixing it would require tracking
 * `${` open and matching `}` close inside template mode, which adds
 * complexity for a case that hasn't been observed in real consumer
 * projects. Worth revisiting only if a real-world bug surfaces.
 */
export function detectQuoteStyle(content: string): "'" | '"' {
	const stripped = stripCommentsRespectingStrings(content)
	let singles = 0
	let doubles = 0
	let i = 0
	while (i < stripped.length) {
		const c = stripped[i]!
		// Only a quote that opens a string is counted (a lone apostrophe in JSX
		// text is not); the string is then stepped over whole, as is a regex
		// literal, so nothing inside either is counted.
		if (QUOTE_CHARS.includes(c)) {
			const closeIndex = findClosingQuote(stripped, i)
			if (closeIndex !== null) {
				if (c === "'") singles++
				if (c === '"') doubles++
				i = closeIndex + 1
				continue
			}
		}
		if (c === '/') {
			const regexEnd = findRegexLiteralEnd(stripped, i)
			if (regexEnd !== null) {
				i = regexEnd + 1
				continue
			}
		}
		i++
	}
	return doubles > singles ? '"' : "'"
}

/**
 * The one rule every scanner in this file uses to decide whether a quote
 * character starts a string: a `'` or `"` does only when it does not sit
 * straight after a word (`don't`, `it's` — a string can follow a keyword like
 * `return`, never an identifier; a backtick after a word is a tagged template
 * and does open one), and any quote only when its closing twin can be found
 * — before the end of the line for `'` and `"` (a JS string cannot span a raw
 * line break), before the end of the text for a backtick. Returns the
 * closing quote's position, or `null` when the quote is not a string opener
 * (a lone `'` in a regex literal or in JSX text, say) and is to be read as an
 * ordinary character. Escaped characters inside the string are skipped.
 *
 * The boundary of a scanner that does not parse JSX: a quote in JSX text
 * that follows a space or punctuation (`rock 'n roll`, `<p>'quoted'</p>`) is
 * still paired with the next twin on its line, and the span between them
 * stepped over as a string — including a `{` or `}` inside it.
 *
 * @param text - the text being scanned
 * @param openIndex - position of the candidate opening quote
 */
export function findClosingQuote(
	text: string,
	openIndex: number,
): number | null {
	const quote = text[openIndex]!
	const isSingleLine = quote !== '`'
	// A backtick straight after a word is a tagged template (`String.raw\`…\``),
	// so the after-a-word rule is for `'` and `"` only.
	const isAfterWord =
		isSingleLine && checkIsEndOfNonKeywordWord(text, openIndex - 1)
	if (isAfterWord) return null
	let i = openIndex + 1
	while (i < text.length) {
		const c = text[i]!
		if (c === '\\') {
			i += 2
			continue
		}
		if (c === quote) return i
		if (isSingleLine && c === '\n') return null
		i++
	}
	return null
}

/**
 * Characters after which a `/` starts a regex literal rather than dividing —
 * the start of an expression. After a name, a number, a `)` or a `]` it is
 * division. Three are deliberately absent, because in the `.tsx` / `.jsx`
 * files the wizard patches they are what JSX sits after: `<` (a `/` straight
 * after it is a closing tag, `</div>`), and `}` and `>` (a `/` after an
 * expression or a tag is JSX text, `{a}/{b}`, `</b>/<i>`). The one real
 * regex-after-`>` shape, an arrow function body (`=> /re/`), is recognised
 * on its own; a regex directly after a `<` or `>` comparison, or at the
 * start of a statement after a block, is rare enough to give up.
 */
const REGEX_LITERAL_PRECEDERS: ReadonlyArray<string> = [
	'(',
	',',
	'=',
	':',
	'[',
	'!',
	'&',
	'|',
	'?',
	'{',
	';',
	'+',
	'-',
	'*',
	'%',
	'~',
	'^',
]

/**
 * The position of the last character of the regex literal that starts at
 * `slashIndex` (its final flag, or its closing `/`), or `null` when that `/`
 * does not start one. Both neighbours of the `/` are read. What comes after
 * rules out a comment opener (`//`, `/*`) and a JSX tag close (`/>`). What
 * comes before decides between a literal and division: a regex literal can
 * only start where an expression can — after one of
 * `REGEX_LITERAL_PRECEDERS`, after an arrow (`=> /re/`), or after a keyword
 * like `return`, with any whitespace and comments between stepped over
 * (`findLastCodeCharBefore`). And a literal that never closes on its line
 * is not one. A quote inside a regex (`/['"]/`) then never opens a string,
 * which is what every scanner in this file relies on.
 *
 * The boundary of a scanner that does not parse JSX: a `/` in JSX text whose
 * preceding text ends in one of the preceders — `&nbsp;/`, `Questions? /`,
 * `Tags: /` — is still read as a literal opener when a second `/` sits later
 * on the same line, and the span between them is then stepped over. A
 * separator written as `{a} / {b}` or `{a}/{b}` is not affected.
 *
 * @param text - the text being scanned
 * @param slashIndex - position of the candidate opening `/`
 */
export function findRegexLiteralEnd(
	text: string,
	slashIndex: number,
): number | null {
	const next = text[slashIndex + 1] ?? ''
	if (next === '/' || next === '*' || next === '>') return null
	const before = findLastCodeCharBefore(text, slashIndex)
	const precedingChar = before < 0 ? '' : text[before]!
	const isAfterArrow = precedingChar === '>' && text[before - 1] === '='
	// Only the tail can hold a keyword, so only the tail is tested.
	const tailStart = before - LONGEST_EXPRESSION_PRECEDING_KEYWORD_LENGTH
	const tail = text.slice(Math.max(0, tailStart), before + 1)
	const isExpressionStart =
		before < 0 ||
		isAfterArrow ||
		REGEX_LITERAL_PRECEDERS.includes(precedingChar) ||
		EXPRESSION_PRECEDING_KEYWORDS.test(tail)
	if (!isExpressionStart) return null
	let i = slashIndex + 1
	let isInCharacterClass = false
	while (i < text.length) {
		const c = text[i]!
		if (c === '\\') {
			i += 2
			continue
		}
		if (c === '\n') return null
		if (isInCharacterClass) {
			if (c === ']') isInCharacterClass = false
		} else if (c === '[') {
			isInCharacterClass = true
		} else if (c === '/') {
			let flagsEnd = i
			while (/[a-z]/i.test(text[flagsEnd + 1] ?? '')) flagsEnd++
			return flagsEnd
		}
		i++
	}
	return null
}

/**
 * The position of the last character of code before `index`, stepping back
 * over whitespace and comments — a `/* … *\/` block, and a `// …` comment
 * on a line the step crosses — or `-1` when there is none. Read on the raw
 * file, so a `//` inside a string on that earlier line is taken for a
 * comment opener too; that line then reads as ending before it.
 *
 * @param text - the text being scanned
 * @param index - the position to look back from
 */
function findLastCodeCharBefore(text: string, index: number): number {
	let before = index - 1
	while (before >= 0) {
		const c = text[before]!
		if (c === '\n') {
			const lineStart = text.lastIndexOf('\n', before - 1) + 1
			const lineCommentAt = text.slice(lineStart, before).indexOf('//')
			before = lineCommentAt < 0 ? before - 1 : lineStart + lineCommentAt - 1
			continue
		}
		if (/\s/.test(c)) {
			before--
			continue
		}
		const isBlockCommentEnd = c === '/' && text[before - 1] === '*'
		if (isBlockCommentEnd) {
			const blockStart = text.lastIndexOf('/*', before - 2)
			if (blockStart < 0) return before
			before = blockStart - 1
			continue
		}
		return before
	}
	return -1
}

/**
 * Find the first occurrence of `<keyword>:` at the immediate level of the
 * scanned range (i.e. depth 0 within the search window, outside any string /
 * template literal / comment, and not nested inside a `{}`/`[]`/`()` group).
 * Returns the position of the **start of the property-key token** (which is
 * the keyword character itself for bare identifiers, or the opening quote for
 * the quoted form) and the position of the value (first character after the
 * colon that is not whitespace or a comment).
 *
 * Both bare-identifier (`addons:`) and quoted (`"addons":`, `'addons':`) property
 * keys are recognized. Quoted-key matching requires the closing quote to land
 * immediately after `<keyword>`, so string literals whose contents merely
 * contain the keyword are still stepped over whole by the string skip below.
 *
 * The shorthand form (`addons,` or `addons }`, short for `addons: addons`) is
 * recognized too, and returned with the value starting at the identifier
 * itself — so a caller checking for a literal `[` / `{` value sees it as a
 * non-literal value rather than as a missing key, and does not add a second
 * `addons:` beside it. The keyword only counts as shorthand when it sits
 * where a key can start: right after the object's `{` or after a `,`.
 *
 * To target a specific config object's keys, pass `{ from, to }` set to the
 * range *inside* that object's braces — e.g. for `const config = { addons: [] }`
 * pass `from = positionAfterOpeningBrace`, `to = positionOfClosingBrace`.
 * Then keys nested in inner objects are skipped (they're at depth > 0 within
 * the range), and unrelated objects elsewhere in the file are out of range
 * entirely.
 */
export function findTopLevelKey(
	content: string,
	keyword: string,
	options: { from?: number; to?: number } = {},
): { keyStart: number; valueStart: number } | null {
	const { from = 0, to = content.length } = options
	const kwLen = keyword.length
	let depth = 0
	let inLC = false
	let inBC = false
	// The last code character seen outside strings and comments — what a
	// shorthand key has to follow. `null` at the start of the range, which for
	// a range inside an object's braces means the key follows the `{`.
	let prevCodeChar: string | null = null

	let i = from
	while (i < to) {
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
		// Quoted property key — `"keyword":` or `'keyword':`. Checked before the
		// string skip below so a quoted key isn't swallowed as a string literal.
		// The closing quote must land immediately after `<keyword>`, so string
		// values that happen to contain the keyword fall through to the string
		// skip and are passed over as before.
		if (depth === 0 && (c === "'" || c === '"')) {
			const afterKey = i + 1 + kwLen
			if (
				afterKey < to &&
				content.startsWith(keyword, i + 1) &&
				content[afterKey] === c
			) {
				const j = skipWhitespaceAndComments(content, afterKey + 1, to)
				if (content[j] === ':') {
					const valueStart = skipWhitespaceAndComments(content, j + 1, to)
					return { keyStart: i, valueStart }
				}
			}
		}
		if (QUOTE_CHARS.includes(c)) {
			const closeIndex = findClosingQuote(content, i)
			if (closeIndex !== null) {
				i = closeIndex + 1
				continue
			}
			// Not a string opener — an ordinary character.
		}
		if (c === '/') {
			const regexEnd = findRegexLiteralEnd(content, i)
			if (regexEnd !== null) {
				i = regexEnd + 1
				continue
			}
		}

		if (
			depth === 0 &&
			content.startsWith(keyword, i) &&
			(i === 0 || !/[A-Za-z0-9_$]/.test(content[i - 1]!)) &&
			!/[A-Za-z0-9_$]/.test(content[i + kwLen] ?? '')
		) {
			// A comment may sit between the key and its `:` / `,` (`addons /* c */:`).
			const j = skipWhitespaceAndComments(content, i + kwLen, to)
			if (content[j] === ':') {
				const valueStart = skipWhitespaceAndComments(content, j + 1, to)
				return { keyStart: i, valueStart }
			}
			const isAtKeyPosition =
				prevCodeChar === null || prevCodeChar === '{' || prevCodeChar === ','
			const isShorthandKey =
				isAtKeyPosition && (content[j] === ',' || content[j] === '}')
			if (isShorthandKey) return { keyStart: i, valueStart: i }
		}

		if (c === '{' || c === '[' || c === '(') depth++
		else if ((c === '}' || c === ']' || c === ')') && depth > 0) depth--
		if (!/\s/.test(c)) prevCodeChar = c
		i++
	}
	return null
}

/**
 * The position of the first character at or after `from` (and before `to`)
 * that is neither whitespace nor part of a line comment or a block comment.
 *
 * @param content - the text being scanned
 * @param from - where to start
 * @param to - where to stop (returned when nothing but whitespace and
 * comments remain)
 */
function skipWhitespaceAndComments(
	content: string,
	from: number,
	to: number,
): number {
	let i = from
	while (i < to) {
		const c = content[i]!
		const next = content[i + 1]
		if (/\s/.test(c)) {
			i++
		} else if (c === '/' && next === '/') {
			while (i < to && content[i] !== '\n') i++
		} else if (c === '/' && next === '*') {
			const close = content.indexOf('*/', i + 2)
			i = close === -1 || close + 2 > to ? to : close + 2
		} else {
			break
		}
	}
	return i
}

/**
 * Find the index of the brace/bracket/paren that closes the one at `openIdx`,
 * respecting strings, template literals, and comments. Returns null if no
 * matching closer is found before end-of-content. The opener character at
 * `openIdx` determines which closer to match (`{`→`}`, `[`→`]`, `(`→`)`).
 */
export function findMatchingBrace(
	content: string,
	openIdx: number,
): number | null {
	const open = content[openIdx]
	let close: string
	if (open === '{') close = '}'
	else if (open === '[') close = ']'
	else if (open === '(') close = ')'
	else return null

	let depth = 0
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
		if (QUOTE_CHARS.includes(c)) {
			const closeIndex = findClosingQuote(content, i)
			if (closeIndex !== null) {
				i = closeIndex + 1
				continue
			}
			// Not a string opener — an ordinary character.
		}
		if (c === '/') {
			const regexEnd = findRegexLiteralEnd(content, i)
			if (regexEnd !== null) {
				i = regexEnd + 1
				continue
			}
		}

		if (c === open) depth++
		else if (c === close) {
			depth--
			if (depth === 0) return i
		}
		i++
	}
	return null
}

/**
 * Strip line and block comments while keeping string and template literals
 * intact. The output is the same length as the input — comment characters are
 * replaced with spaces (newlines inside comments are preserved as-is) so byte
 * indices in the stripped content correspond directly to positions in the
 * original. That lets callers run a regex against the stripped output and use
 * `match.index` to locate the corresponding position in the unstripped file.
 */
export function stripCommentsRespectingStrings(content: string): string {
	let out = ''
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
			} else {
				out += ' '
			}
			i++
			continue
		}
		if (inBC) {
			if (c === '*' && next === '/') {
				inBC = false
				out += '  '
				i += 2
				continue
			}
			out += c === '\n' ? '\n' : ' '
			i++
			continue
		}
		if (c === '/' && next === '/') {
			inLC = true
			out += '  '
			i += 2
			continue
		}
		if (c === '/' && next === '*') {
			inBC = true
			out += '  '
			i += 2
			continue
		}
		// A string or a regex literal is copied through whole (see
		// `findClosingQuote` / `findRegexLiteralEnd` for what counts as one); a
		// lone quote that opens none is an ordinary character.
		if (QUOTE_CHARS.includes(c)) {
			const closeIndex = findClosingQuote(content, i)
			if (closeIndex !== null) {
				out += content.slice(i, closeIndex + 1)
				i = closeIndex + 1
				continue
			}
		}
		if (c === '/') {
			const regexEnd = findRegexLiteralEnd(content, i)
			if (regexEnd !== null) {
				out += content.slice(i, regexEnd + 1)
				i = regexEnd + 1
				continue
			}
		}
		out += c
		i++
	}
	return out
}

/**
 * Blank the contents of string and template literals — each character between
 * the quotes becomes a space, the quotes stay, so every position is preserved
 * — for searches that must only see code structure. A code sample held in a
 * string (`const example = 'definePreview({})'`) then cannot be mistaken for
 * the real thing.
 *
 * A quote only opens a string when its closing twin can be found (the shared
 * `findClosingQuote` rule): on the same line for `'` and `"`, anywhere later
 * in the text for a backtick. A quote with no twin — an apostrophe in JSX
 * text — is left as it is, so it cannot blank the rest of the file. A regex
 * literal (`/['"]/`) is stepped over whole, and its pattern is blanked
 * whenever `'…'` strings are, so its quotes never count. Run it on
 * comment-stripped text; a quote inside a comment would otherwise count.
 *
 * @param codeOnly - text with comments already stripped
 * @param quotes - the quote characters to blank; the default is all three,
 * and a caller that needs `'…'` / `"…"` contents kept (an import matcher
 * reading a package name) passes only the backtick
 */
export function blankStringContents(
	codeOnly: string,
	quotes: ReadonlyArray<string> = QUOTE_CHARS,
): string {
	let out = ''
	let i = 0
	while (i < codeOnly.length) {
		const c = codeOnly[i]!
		// Every string is stepped over whole, whichever kind it is, so a
		// backtick inside a `'…'` string cannot open a template literal; only
		// the requested kinds have their contents blanked. A regex literal is
		// stepped over too, and blanked between its slashes whenever `'…'`
		// strings are — its quotes and brackets are no more structure than a
		// string's.
		if (QUOTE_CHARS.includes(c)) {
			const closeIndex = findClosingQuote(codeOnly, i)
			if (closeIndex !== null) {
				const contents = codeOnly.slice(i + 1, closeIndex)
				const blanked = quotes.includes(c)
					? contents.replace(/[^\n]/g, ' ')
					: contents
				out += c + blanked + c
				i = closeIndex + 1
				continue
			}
		}
		if (c === '/') {
			const regexEnd = findRegexLiteralEnd(codeOnly, i)
			if (regexEnd !== null) {
				const literal = codeOnly.slice(i, regexEnd + 1)
				const closingSlash = literal.lastIndexOf('/')
				const pattern = literal.slice(1, closingSlash)
				const doesBlankRegex = quotes.includes("'")
				out += doesBlankRegex
					? `/${' '.repeat(pattern.length)}${literal.slice(closingSlash)}`
					: literal
				i = regexEnd + 1
				continue
			}
		}
		out += c
		i++
	}
	return out
}

/**
 * Backslash-escape every character that has a special meaning in a regex,
 * so the text only matches itself.
 *
 * @param text - an identifier, package name or path to match literally
 */
export function escapeForRegex(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Make an argument survive `cmd.exe` when a child process is spawned with
 * `shell: true` on Windows. `^` is the cmd.exe escape character, so a bare
 * `^src/` or `^10.2.0` loses its caret — and when the target is a `.cmd`
 * shim (npm, yarn, a `node_modules/.bin` tool) the batch file's `%*` hands the
 * args to cmd.exe a second time, so doubling the caret (`^^`) is stripped
 * again on that second pass. Wrapping the argument in double quotes survives
 * both passes: cmd.exe keeps the quotes and leaves their contents alone, and
 * the program's own argument parser removes them. The same quoting protects
 * spaces and the `&`, `|`, `<`, `>`, `(` and `)` characters cmd.exe acts on,
 * which a version range like `>=10 <12` can carry. Quoting does not stop
 * cmd.exe expanding `%NAME%`, so this is only suitable for arguments that
 * cannot carry a percent sign — its one caller, the wizard's package-manager
 * install, passes package names and version specifiers. Anything that takes a
 * user path should spawn without a shell instead (see `runDepCruiseOnce` in
 * `sb-deps`). `!` is quoted too, though cmd.exe only acts on it under delayed
 * expansion, which the package managers' `.cmd` shims never switch on.
 * Arguments with none of those characters are returned unchanged.
 */
export function escapeForCmdExe(arg: string): string {
	const hasCmdExeSpecialCharacter = /[\s^&|<>()!%]/.test(arg)
	if (!hasCmdExeSpecialCharacter) return arg
	return `"${arg}"`
}

/** A package found by `findInstalledPackage`: where it lives and its parsed `package.json`. */
export interface InstalledPackage {
	/** Absolute path of the package's folder (the one holding its `package.json`). */
	dir: string
	/** The parsed `package.json`. */
	pkg: Record<string, unknown>
}

/**
 * Find a package installed for the project by walking the `node_modules`
 * folders from `startDir` up to the filesystem root, the way Node's own
 * lookup does — npm and yarn workspaces hoist packages to the repository
 * root, where a fixed `<project>/node_modules/<name>` path never finds them.
 * Deliberately NOT `require.resolve`: that also searches `NODE_PATH`, which
 * the shim `pnpm dlx` runs this CLI through points at the CLI's own
 * dependency folder, so a project without the package installed would find
 * the CLI's copy instead. Returns `null` when no folder on the way up holds
 * a readable `package.json` for it.
 */
export function findInstalledPackage(
	startDir: string,
	packageName: string,
): InstalledPackage | null {
	let dir = resolve(startDir)
	while (true) {
		const pkgDir = join(dir, 'node_modules', packageName)
		const pkgJsonPath = join(pkgDir, 'package.json')
		if (existsSync(pkgJsonPath)) {
			try {
				const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'))
				return { dir: pkgDir, pkg }
			} catch {
				// unreadable package.json — keep walking up
			}
		}
		const parent = dirname(dir)
		if (parent === dir) return null
		dir = parent
	}
}
