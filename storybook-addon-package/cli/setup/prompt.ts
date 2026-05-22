/* eslint-disable no-console */
import { createInterface } from 'node:readline'

/**
 * Read a single line of input from the user. Returns the raw (untrimmed)
 * response so callers can distinguish a blank-Enter ("") from a whitespace-
 * only ("   ") response when that distinction matters.
 */
export function ask(question: string): Promise<string> {
	const rl = createInterface({ input: process.stdin, output: process.stdout })
	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close()
			resolve(answer)
		})
	})
}

export async function confirm(
	question: string,
	defaultYes = true,
): Promise<boolean> {
	const suffix = defaultYes ? ' [Y/n] ' : ' [y/N] '
	const raw = (await ask(question + suffix)).trim().toLowerCase()
	if (!raw) return defaultYes
	return raw === 'y' || raw === 'yes'
}

/**
 * Three-way confirmation prompt: yes, no, or edit. Used in the wizard's
 * "proceed with detected values" step so users can override one or more
 * auto-detected fields without having to abort the whole run.
 *
 * Spells the options out on their own lines because `[Y/n/e]` alone gives
 * the user no way to know what `e` does — discoverability matters more
 * here than terseness, and this prompt only fires once per wizard run.
 *
 * Default is "yes" (pressing Enter accepts the detected values). Any input
 * that isn't recognised re-prompts the user.
 */
export async function confirmOrEdit(
	question: string,
): Promise<'yes' | 'no' | 'edit'> {
	while (true) {
		// eslint-disable-next-line no-console
		console.log(question)
		// eslint-disable-next-line no-console
		console.log('  Y = yes, accept detected values (default — press Enter)')
		// eslint-disable-next-line no-console
		console.log('  N = no, cancel setup')
		// eslint-disable-next-line no-console
		console.log('  E = edit detected values one-by-one')
		const raw = (await ask('  > ')).trim().toLowerCase()
		if (!raw) return 'yes'
		if (raw === 'y' || raw === 'yes') return 'yes'
		if (raw === 'n' || raw === 'no') return 'no'
		if (raw === 'e' || raw === 'edit') return 'edit'
		// eslint-disable-next-line no-console
		console.log(
			`  "${raw}" not recognised. Please answer Y, N, or E (or press Enter for the default).`,
		)
	}
}

export async function input(
	question: string,
	defaultValue = '',
): Promise<string> {
	const suffix = defaultValue ? ` (${defaultValue}) ` : ' '
	const raw = (await ask(question + suffix)).trim()
	return raw || defaultValue
}

export async function choose<T extends string>(
	question: string,
	options: ReadonlyArray<{ label: string; value: T }>,
): Promise<T> {
	console.log(question)
	options.forEach((opt, i) => {
		console.log(`  ${i + 1}) ${opt.label}`)
	})
	while (true) {
		const raw = (await ask('  > ')).trim()
		const n = Number(raw)
		if (Number.isInteger(n) && n >= 1 && n <= options.length) {
			return options[n - 1]!.value
		}
		console.log(`  Please enter a number between 1 and ${options.length}.`)
	}
}
