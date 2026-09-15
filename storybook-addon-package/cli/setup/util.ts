import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

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
 * commented-out example doesn't skew the count, and uses a tiny state
 * machine so quote characters that appear *inside* the other quote's
 * string literal don't get double-counted.
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
	let mode: 'normal' | "'" | '"' | '`' = 'normal'
	for (let i = 0; i < stripped.length; i++) {
		const ch = stripped[i]
		if (mode === 'normal') {
			if (ch === "'") {
				singles++
				mode = "'"
			} else if (ch === '"') {
				doubles++
				mode = '"'
			} else if (ch === '`') {
				mode = '`'
			}
			continue
		}
		// Inside a string/template — skip escapes, exit on matching closer.
		if (ch === '\\') {
			i++
			continue
		}
		if (ch === mode) {
			mode = 'normal'
		}
	}
	return doubles > singles ? '"' : "'"
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
 * contain the keyword are still safely skipped via the existing string-mode
 * entry below.
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
	let inSQ = false
	let inDQ = false
	let inTL = false
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
		// Quoted property key — `"keyword":` or `'keyword':`. Checked before the
		// string-entry branches below so a quoted key isn't swallowed as a string
		// literal. The closing quote must land immediately after `<keyword>`, so
		// string values that happen to contain the keyword fall through to the
		// real string-entry logic and are skipped as before.
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
/**
 * Blank the contents of every string and template literal — each character
 * between the quotes becomes a space, the quotes stay, so every position is
 * preserved — for searches that must only see code structure. A code sample
 * held in a string (`const example = 'definePreview({})'`) then cannot be
 * mistaken for the real thing. Run it on comment-stripped text; a quote
 * inside a comment would otherwise open a string that never closes.
 *
 * @param codeOnly - text with comments already stripped
 */
export function blankStringContents(codeOnly: string): string {
	let out = ''
	let openQuote: string | null = null
	let i = 0
	while (i < codeOnly.length) {
		const c = codeOnly[i]!
		if (openQuote === null) {
			out += c
			if (c === "'" || c === '"' || c === '`') openQuote = c
			i++
			continue
		}
		if (c === '\\') {
			// The escaped character is part of the string too.
			const hasEscapedChar = i + 1 < codeOnly.length
			out += hasEscapedChar ? '  ' : ' '
			i += hasEscapedChar ? 2 : 1
			continue
		}
		if (c === openQuote) {
			out += c
			openQuote = null
		} else {
			out += c === '\n' ? '\n' : ' '
		}
		i++
	}
	return out
}

export function stripCommentsRespectingStrings(content: string): string {
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
