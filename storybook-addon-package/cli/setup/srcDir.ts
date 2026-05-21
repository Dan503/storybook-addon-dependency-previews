import { statSync } from 'node:fs'
import { resolve } from 'node:path'

import type { Framework } from './detect.js'
import { input } from './prompt.js'

export type ResolvedSrcDir = {
	/**
	 * The resolved source-folder name. Empty string is a deliberate sentinel
	 * meaning "the project root *is* the source folder" (no subfolder filter).
	 */
	srcDir: string
	/** Whether the resolution required a user prompt (Next.js fallback). */
	promptedUser: boolean
	/** True when srcDir differs from the bundled default `'src'`; drives whether we write a project-root `sb-deps.config.{js,cjs}`. */
	isCustom: boolean
}

/**
 * Mirror of the validator at `sb-deps.ts` srcDir loader — single path segment,
 * alphanumerics + `.`, `_`, `-` only. Excludes the empty string deliberately;
 * empty is its own input contract here (handled via the `.` shortcut).
 */
const SAFE_SRCDIR_PATTERN = /^[A-Za-z0-9._-]+$/

function dirExists(cwd: string, name: string): boolean {
	try {
		return statSync(resolve(cwd, name)).isDirectory()
	} catch {
		return false
	}
}

/**
 * Resolve the source folder for the project. For every framework except Next.js
 * the answer is the bundled default `'src'` with no probing or prompting —
 * the convention is uniform there. Next.js is the edge case: source can live
 * at `src/`, `app/`, `pages/`, or directly at the project root.
 */
export async function resolveSrcDir(
	cwd: string,
	framework: Framework,
): Promise<ResolvedSrcDir> {
	if (framework !== 'nextjs-webpack') {
		return { srcDir: 'src', promptedUser: false, isCustom: false }
	}

	// Next.js: probe filesystem before bothering the user.
	if (dirExists(cwd, 'src')) {
		return { srcDir: 'src', promptedUser: false, isCustom: false }
	}

	const suggestion = pickNextjsSuggestion(cwd)
	const chosen = await promptForSrcDir(suggestion)
	return {
		srcDir: chosen,
		promptedUser: true,
		isCustom: chosen !== 'src',
	}
}

/**
 * Pick the most likely source-folder name for a Next.js project that doesn't
 * have a `src/` folder. Prefer `app/` over `pages/` when both are present —
 * App Router is the current Next.js default. Fall back to `app` as a typed
 * default when neither exists so users on a brand-new repo still see a
 * sensible suggestion they can accept with one keystroke.
 */
function pickNextjsSuggestion(cwd: string): string {
	if (dirExists(cwd, 'app')) return 'app'
	if (dirExists(cwd, 'pages')) return 'pages'
	return 'app'
}

async function promptForSrcDir(suggestion: string): Promise<string> {
	const message = [
		'\n= Source folder =',
		'No `src/` folder found.',
		`Suggestion: '${suggestion}' (press Enter to accept).`,
		'Type "." to treat the project root as the source folder.',
		'Source folder name:',
	].join('\n')

	while (true) {
		const raw = (await input(message, suggestion)).trim()
		// "." (or "./") → project-root mode. Normalise to the empty-string sentinel.
		if (raw === '.' || raw === './') return ''
		if (SAFE_SRCDIR_PATTERN.test(raw)) return raw
		// eslint-disable-next-line no-console
		console.log(
			`  Invalid folder name "${raw}" — must be alphanumerics, ".", "_", or "-" (or "." for project root). Try again.`,
		)
	}
}

