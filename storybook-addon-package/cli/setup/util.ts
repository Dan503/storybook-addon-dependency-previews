// Detect the file's leading indent unit (one level deep) — first indented line wins.
// Defaults to a tab so a file with no existing indent doesn't end up un-indented.
export function detectFileIndent(content: string): string {
	const m = content.match(/^([ \t]+)\S/m)
	return m ? m[1]! : '\t'
}

// Detect the file's line-ending style. CRLF if any CRLF is present, else LF.
export function detectEol(content: string): string {
	return content.includes('\r\n') ? '\r\n' : '\n'
}

// Detect the project's preferred string-literal quote style by reading the first
// import statement's `from <q>...<q>` quote. Defaults to single quotes.
//
// The regex runs against `stripCommentsRespectingStrings(content)` so a leading
// commented-out example like `// import x from "y"` (or a multi-line block-comment
// example) can't pick up the wrong quote style. The strip is position-preserving,
// so the captured quote character is identical to the one in the original.
export function detectQuoteStyle(content: string): "'" | '"' {
	const m = stripCommentsRespectingStrings(content).match(
		/import[\s\S]+?from\s+(['"])/,
	)
	return m ? (m[1] as "'" | '"') : "'"
}

// Find the first occurrence of `<keyword>:` at the immediate level of the scanned
// range (i.e. depth 0 within the search window, outside any string / template
// literal / comment, and not nested inside a `{}`/`[]`/`()` group). Returns the
// position of `<keyword>` and the position of the value (first non-whitespace
// char after the colon).
//
// To target a specific config object's keys, pass `{ from, to }` set to the
// range *inside* that object's braces — e.g. for `const config = { addons: [] }`
// pass `from = positionAfterOpeningBrace`, `to = positionOfClosingBrace`. Then
// keys nested in inner objects are skipped (they're at depth > 0 within the
// range), and unrelated objects elsewhere in the file are out of range entirely.
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
			let j = i + kwLen
			while (j < to && /\s/.test(content[j]!)) j++
			if (content[j] === ':') {
				j++
				while (j < to && /\s/.test(content[j]!)) j++
				return { keyStart: i, valueStart: j }
			}
		}

		if (c === '{' || c === '[' || c === '(') depth++
		else if ((c === '}' || c === ']' || c === ')') && depth > 0) depth--
		i++
	}
	return null
}

// Find the index of the brace/bracket/paren that closes the one at `openIdx`,
// respecting strings, template literals, and comments. Returns null if no
// matching closer is found before end-of-content. The opener character at
// `openIdx` determines which closer to match (`{`→`}`, `[`→`]`, `(`→`)`).
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

// Strip line and block comments while keeping string and template literals intact.
// The output is the same length as the input — comment characters are replaced
// with spaces (newlines inside comments are preserved as-is) so byte indices in
// the stripped content correspond directly to positions in the original. That
// lets callers run a regex against the stripped output and use `match.index`
// to locate the corresponding position in the unstripped file.
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
