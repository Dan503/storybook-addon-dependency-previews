// Helpers shared by the three processes of the sb-deps pipeline — the watcher
// (`sb-deps.ts`), the graph filter (`postprocess.ts`, run as its own `node`
// process), and the bundled dependency-cruiser config (`depcruise.config.ts`,
// loaded inside the `depcruise` process). Each runs separately, so importing
// from here is the only way they stay agreed on these rules — a re-spelled
// local copy is how the watcher and the graph filter end up disagreeing about
// the same path.

/**
 * Do this platform's file system (FS) paths ignore case? Windows and macOS
 * treat them as case-insensitive, and comparisons here have to match that, or a
 * casing difference between `process.cwd()` and the paths the watcher reports
 * (drive-letter casing being the usual culprit) reads as a different path.
 */
export const IS_CASE_INSENSITIVE_PATH_FS =
	process.platform === 'win32' || process.platform === 'darwin'

/** Backslash-escape every character that has a special meaning in a regex, so the text only matches itself. */
export function escapeForRegex(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Like `escapeForRegex`, but every letter becomes a pair matching both of its
 * cases (`s` → `[sS]`). For a pattern that has to ignore case in a place we
 * can't hand the compiled regex an `i` flag — dependency-cruiser builds its
 * `--include-only` regex itself, with no flags.
 */
export function escapeForRegexIgnoringCase(text: string): string {
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
