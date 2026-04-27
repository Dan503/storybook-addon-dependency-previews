import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { confirm } from '../prompt.js'

export const TARGET_SCRIPTS: Record<string, string> = {
	sb: 'sb-deps --watch --run-storybook',
	'sb:deps': 'sb-deps',
	'sb:build': 'sb-deps && storybook build',
}

export type ScriptOutcome =
	| { name: string; action: 'added' }
	| { name: string; action: 'kept' }
	| { name: string; action: 'overwritten'; previous: string }
	| { name: string; action: 'unchanged' }

export type PackageJsonPatchResult = {
	kind: 'updated' | 'no-change' | 'failed'
	outcomes: Array<ScriptOutcome>
	reason?: string
}

function detectIndent(raw: string): string | number {
	const m = raw.match(/^(\t|  +)\S/m)
	if (!m) return 2
	return m[1] === '\t' ? '\t' : m[1]!.length
}

export async function patchPackageJson(
	cwd: string,
): Promise<PackageJsonPatchResult> {
	const path = resolve(cwd, 'package.json')
	let raw: string
	try {
		raw = readFileSync(path, 'utf8')
	} catch (e) {
		return {
			kind: 'failed',
			outcomes: [],
			reason: `Could not read package.json: ${(e as Error).message}`,
		}
	}

	const indent = detectIndent(raw)
	let pkg: Record<string, unknown>
	try {
		pkg = JSON.parse(raw)
	} catch (e) {
		return {
			kind: 'failed',
			outcomes: [],
			reason: `package.json is not valid JSON: ${(e as Error).message}`,
		}
	}

	if (
		pkg.scripts !== undefined &&
		(typeof pkg.scripts !== 'object' ||
			pkg.scripts === null ||
			Array.isArray(pkg.scripts))
	) {
		return {
			kind: 'failed',
			outcomes: [],
			reason:
				'package.json "scripts" field exists but is not a plain object — refusing to overwrite.',
		}
	}
	const scripts = (pkg.scripts ??= {}) as Record<string, string>
	const outcomes: Array<ScriptOutcome> = []
	let changed = false

	for (const [name, target] of Object.entries(TARGET_SCRIPTS)) {
		const existing = scripts[name]
		if (existing === target) {
			outcomes.push({ name, action: 'unchanged' })
			continue
		}
		if (existing === undefined) {
			scripts[name] = target
			outcomes.push({ name, action: 'added' })
			changed = true
			continue
		}
		const overwrite = await confirm(
			`A "${name}" script already exists (\`${existing}\`). Overwrite with \`${target}\`?`,
			false,
		)
		if (overwrite) {
			outcomes.push({ name, action: 'overwritten', previous: existing })
			scripts[name] = target
			changed = true
		} else {
			outcomes.push({ name, action: 'kept' })
		}
	}

	if (!changed) {
		return { kind: 'no-change', outcomes }
	}

	const eol = raw.includes('\r\n') ? '\r\n' : '\n'
	const hadTrailingNewline = raw.endsWith('\n')
	let serialised = JSON.stringify(pkg, null, indent)
	if (eol === '\r\n') serialised = serialised.replace(/\n/g, '\r\n')
	if (hadTrailingNewline) serialised += eol
	writeFileSync(path, serialised, 'utf8')
	return { kind: 'updated', outcomes }
}
