/* eslint-disable no-console */
import { createInterface } from 'node:readline'

function ask(question: string): Promise<string> {
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
