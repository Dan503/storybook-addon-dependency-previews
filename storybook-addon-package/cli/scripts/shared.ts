// Helpers shared by the three processes of the sb-deps pipeline — the watcher
// (`sb-deps.ts`), the graph filter (`postprocess.ts`, run as its own `node`
// process), and the bundled dependency-cruiser config (`depcruise.config.ts`,
// loaded inside the `depcruise` process). Each runs separately, so importing
// from here is the only way they stay agreed on these rules — a re-spelled
// local copy is how the watcher and the graph filter end up disagreeing about
// the same path.

/**
 * Does this platform treat two spellings of the same name as the same file?
 * Windows and macOS do; Linux does not. Each of the three programs applies it
 * differently — one picks a regular-expression flag, another writes a pattern
 * matching both capitalisations — so the rule itself lives here and only the
 * rule is shared.
 */
export const IS_CASE_INSENSITIVE_PATH_FS =
	process.platform === 'win32' || process.platform === 'darwin'

/**
 * Escape a folder name for a pattern that has to match a path on disk, and
 * decide for the caller whether the pattern should ignore case. On the
 * platforms whose file systems ignore case it matches either capitalisation,
 * because `src` and `Src` are the same folder there; elsewhere it matches the
 * name exactly, because there they really are two different folders.
 *
 * Use this wherever the pattern is compiled without an ignore-case flag and so
 * has to carry the case rule in the pattern itself — the `--include-only`
 * argument handed to dependency-cruiser, and the rule matchers in the bundled
 * dependency-cruiser config. Somewhere that compiles its own regex can ask for
 * the ignore-case flag instead and uses the plain escape below.
 */
export function escapeForPathRegex(text: string): string {
	return IS_CASE_INSENSITIVE_PATH_FS
		? escapeForRegexIgnoringCase(text)
		: escapeForRegex(text)
}

/** Backslash-escape every character that has a special meaning in a regex, so the text only matches itself. */
export function escapeForRegex(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Like `escapeForRegex`, but every letter becomes a pair matching both of its
 * cases (`s` → `[sS]`). For a pattern that has to ignore case in a place we
 * can't hand the compiled regex an `i` flag — dependency-cruiser builds its
 * `--include-only` regex itself, with no flags. Reached through
 * `escapeForPathRegex`, which owns the platform decision.
 */
function escapeForRegexIgnoringCase(text: string): string {
	return text
		.split('')
		.map((char) => {
			const isLetter = /[a-z]/i.test(char)
			return isLetter
				? `[${char.toLowerCase()}${char.toUpperCase()}]`
				: escapeForRegex(char)
		})
		.join('')
}
