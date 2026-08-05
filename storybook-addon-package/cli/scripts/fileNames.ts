import { readdirSync } from 'node:fs'

// Shared by the watcher (`sb-deps.ts`) and the graph filter
// (`postprocess.ts`), which run as separate processes. The watcher checks a
// file's name as it is created; the graph filter checks the names it finds
// already on disk. Both have to agree on what a correctly-spelled name looks
// like, and a re-spelled second copy is how two processes end up disagreeing
// about the same file.

/**
 * The name endings this tool reads meaning into, and the extensions each one
 * means anything on. `null` means any extension.
 *
 * Tied to an extension because an ending only earns attention where this tool
 * would act on it. `.decorator` is a Svelte idea, so a NestJS
 * `Roles.Decorator.ts` is none of our business — reading it as a decorator
 * would refuse a perfectly good file on creation and go on naming it in every
 * build afterwards. `.component` is the same for Angular.
 *
 * Order does not matter: no entry is the ending of another, and they are
 * matched with `endsWith`, so `.story` can never claim part of a `.stories`
 * name.
 */
const NAME_ENDINGS: ReadonlyArray<{
	ending: string
	extensions: ReadonlyArray<string> | null
}> = [
	{ ending: '.stories', extensions: null },
	{ ending: '.story', extensions: null },
	{ ending: '.component', extensions: ['.ts', '.html'] },
	{ ending: '.decorator', extensions: ['.svelte'] },
]

/** Is this file name spelled in a way the rest of the tool can't match exactly? */
export function checkIsNameWronglyCased(fileName: string): boolean {
	return getNameWithLowerCasedEndings(fileName) !== fileName
}

/**
 * A folder's entries, or `null` when it can't be read.
 *
 * Shared for the same reason as the naming rule above: both processes have to
 * ask the folder what it actually holds rather than ask whether a file exists,
 * because on Windows and macOS an existence check opens `Button.Stories.tsx`
 * when asked for `Button.stories.tsx` — and treating those as one file is the
 * whole thing this tool no longer does.
 */
export function readFolderEntriesOrNull(
	directory: string,
): Array<string> | null {
	try {
		return readdirSync(directory)
	} catch {
		return null
	}
}

/**
 * The file name with its extension and any known endings lower-cased, and the
 * rest of the name left exactly as it was.
 *
 * That leaves a dotted name alone only when none of its dotted parts is an
 * ending that means something on this extension: `Table.Row.tsx` comes back
 * untouched, `My.Story.tsx` becomes `My.story.tsx`, and a NestJS
 * `Roles.Decorator.ts` is untouched because `.decorator` is only read on
 * `.svelte`.
 *
 * Endings are peeled off one at a time because they stack: Angular's
 * `Button.Component.Stories.ts` has two, and fixing only the last one would
 * hand back a name still wrong in the middle.
 *
 * A name this returns unchanged is one the rest of the tool can match exactly,
 * which is what lets its patterns spell one name and mean one file.
 */
export function getNameWithLowerCasedEndings(fileName: string): string {
	const lastDotIndex = fileName.lastIndexOf('.')
	const hasExtension = lastDotIndex > 0
	const extension = hasExtension ? fileName.slice(lastDotIndex) : ''
	const comparableExtension = extension.toLowerCase()
	let remainingName = hasExtension ? fileName.slice(0, lastDotIndex) : fileName
	let endings = ''
	let ending = getNameEnding(remainingName, comparableExtension)
	while (ending) {
		endings = ending + endings
		remainingName = remainingName.slice(0, -ending.length)
		ending = getNameEnding(remainingName, comparableExtension)
	}
	return remainingName + endings + comparableExtension
}

/** Which ending this name carries that means something on `comparableExtension`, however it is capitalised, or `null` for none. */
function getNameEnding(
	name: string,
	comparableExtension: string,
): string | null {
	const comparableName = name.toLowerCase()
	const match = NAME_ENDINGS.find((candidate) => {
		if (!comparableName.endsWith(candidate.ending)) return false
		return candidate.extensions?.includes(comparableExtension) ?? true
	})
	return match?.ending ?? null
}
