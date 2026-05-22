import { statSync } from 'node:fs'
import { resolve } from 'node:path'

import type { Framework } from './detect.js'
import { ask } from './prompt.js'

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
 * empty means "project root is the source folder" and is signalled by either
 * the `.` typed shortcut or, in not-detected mode, a blank Enter (the prompt
 * defaults to `''` in that case so the user's blank input maps directly to
 * the project-root sentinel).
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

	const detected = detectNextjsSourceFolder(cwd)
	const chosen = await promptForSrcDir(detected)
	return {
		srcDir: chosen,
		promptedUser: true,
		isCustom: chosen !== 'src',
	}
}

/**
 * Probe the filesystem for a Next.js source folder. Prefer `app/` over
 * `pages/` when both are present — App Router is the current Next.js
 * default. Returns `null` when nothing recognisable exists at the project
 * root, which the prompt treats as a strong signal that the project root
 * itself is the source folder (the user's stated intent: "no source folder
 * = use project root").
 */
function detectNextjsSourceFolder(cwd: string): string | null {
	if (dirExists(cwd, 'app')) return 'app'
	if (dirExists(cwd, 'pages')) return 'pages'
	return null
}

/**
 * Prompt the user for the Next.js source folder, with two distinct modes:
 *
 * - **Detected mode** (`app/` or `pages/` exists): pressing Enter on a
 *   blank line accepts the detected folder. Type any other folder name
 *   to override, or `.` to use the project root.
 * - **Not-detected mode** (neither folder exists): pressing Enter on a
 *   blank line maps to `''` (the project-root sentinel). Type a folder
 *   name (`app`, `pages`, anything else) to use it instead.
 *
 * Uses `ask()` directly rather than `input()` so we can see the raw
 * untrimmed line and tell whether the user actually pressed Enter on a
 * blank line vs. typed whitespace — whitespace-only inputs re-prompt
 * with a hint instead of silently collapsing to project-root mode.
 *
 * This split lets a detected layout work with one keystroke while still
 * honouring the user's stated rule that an absent source folder maps to
 * project-root mode.
 */
async function promptForSrcDir(detected: string | null): Promise<string> {
	const headerLines =
		detected !== null
			? [
					'\n= Source folder =',
					`Detected '${detected}/' at the project root.`,
					`Press Enter to use '${detected}', "." to use the project root, or type a different folder name.`,
				]
			: [
					'\n= Source folder =',
					'No `src/`, `app/`, or `pages/` folder found.',
					'Press Enter to use the project root as the source folder, or type a folder name (e.g. "app").',
				]
	const suffix = detected !== null ? ` (${detected}) ` : ' '
	const question = headerLines.join('\n') + '\nSource folder name:' + suffix

	while (true) {
		const rawInput = await ask(question)
		// Truly-blank Enter (empty raw input) accepts the contract:
		//   detected   → use the detected folder
		//   not-detected → use the project root ('')
		if (rawInput === '') return detected ?? ''

		const trimmed = rawInput.trim()
		// Whitespace-only input is almost certainly a typo (a stray space
		// followed by Enter). Don't silently collapse it into project-root
		// mode in not-detected projects — re-prompt so the user can pick
		// deliberately.
		if (trimmed === '') {
			// eslint-disable-next-line no-console
			console.log(
				'  Empty/whitespace input. Press Enter to accept the default, type "." for project root, or type a folder name.',
			)
			continue
		}

		// "." (or "./") → explicit project-root mode in both detected and
		// not-detected projects.
		if (trimmed === '.' || trimmed === './') return ''

		// ".." (or "../") is a path-traversal segment, not a folder name —
		// the validator's character allow-list lets it through, so reject
		// it explicitly here.
		if (trimmed === '..' || trimmed === '../') {
			// eslint-disable-next-line no-console
			console.log(
				'  ".." is not a valid source folder. Type a folder name, or "." for the project root.',
			)
			continue
		}

		if (SAFE_SRCDIR_PATTERN.test(trimmed)) return trimmed
		// eslint-disable-next-line no-console
		console.log(
			`  Invalid folder name "${trimmed}" — must be alphanumerics, ".", "_", or "-" (or "." for project root). Try again.`,
		)
	}
}

