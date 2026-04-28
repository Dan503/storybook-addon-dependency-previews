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
export function detectQuoteStyle(content: string): "'" | '"' {
	const m = content.match(/import[\s\S]+?from\s+(['"])/)
	return m ? (m[1] as "'" | '"') : "'"
}

// Find the first occurrence of `<keyword>:` at top level (i.e. outside any string,
// template literal, line comment, or block comment), returning the position of
// `<keyword>` and the position of the value (first non-whitespace char after the colon).
// Used by both patchers to locate `addons:` / `parameters:` / `decorators:` keys
// without being fooled by examples sitting inside comments or strings.
export function findTopLevelKey(
	content: string,
	keyword: string,
): { keyStart: number; valueStart: number } | null {
	const kwLen = keyword.length
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

		if (
			content.startsWith(keyword, i) &&
			(i === 0 || !/[A-Za-z0-9_$]/.test(content[i - 1]!)) &&
			!/[A-Za-z0-9_$]/.test(content[i + kwLen] ?? '')
		) {
			let j = i + kwLen
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

// Strip line and block comments while keeping string and template literals intact.
// Used for identifier presence / `module.exports` checks so commented-out example
// code can't false-positive — and so a `//` or `*/` sitting inside a string literal
// (e.g. a URL) doesn't get stripped along with the comment.
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
