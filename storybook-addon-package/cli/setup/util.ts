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
