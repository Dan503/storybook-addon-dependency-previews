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
 * - **Detected mode** (`app/` or `pages/` exists): the detected folder is
 *   the Enter-key default. Pressing Enter accepts it. Type any other folder
 *   name to override, or `.` to use the project root.
 * - **Not-detected mode** (neither folder exists): pressing Enter is the
 *   "no source folder" signal — `input(_, '')` returns `''`, which is the
 *   project-root sentinel. Type a folder name (`app`, `pages`, anything
 *   else) to use it instead.
 *
 * This split lets a detected layout work with one keystroke while still
 * honouring the user's stated rule that an absent source folder maps to
 * project-root mode.
 */
async function promptForSrcDir(detected: string | null): Promise<string> {
	const message =
		detected !== null
			? [
					'\n= Source folder =',
					`Detected '${detected}/' at the project root.`,
					`Press Enter to use '${detected}', "." to use the project root, or type a different folder name.`,
					'Source folder name:',
				].join('\n')
			: [
					'\n= Source folder =',
					'No `src/`, `app/`, or `pages/` folder found.',
					'Press Enter to use the project root as the source folder, or type a folder name (e.g. "app").',
					'Source folder name:',
				].join('\n')

	const defaultValue = detected ?? ''
	while (true) {
		const raw = (await input(message, defaultValue)).trim()
		// "." (or "./") → explicit project-root mode.
		if (raw === '.' || raw === './') return ''
		// Empty input falls through to the default; in not-detected mode the
		// default is '', which is what we want for the "blank = project root"
		// rule. Return it directly.
		if (raw === '') return ''
		if (SAFE_SRCDIR_PATTERN.test(raw)) return raw
		// eslint-disable-next-line no-console
		console.log(
			`  Invalid folder name "${raw}" — must be alphanumerics, ".", "_", or "-" (or "." for project root). Try again.`,
		)
	}
}

