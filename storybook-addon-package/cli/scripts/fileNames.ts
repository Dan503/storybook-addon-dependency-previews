// Shared by the watcher (`sb-deps.ts`) and the graph filter
// (`postprocess.ts`), which run as separate processes. The watcher checks a
// file's name as it is created; the graph filter checks the names it finds
// already on disk. Both have to agree on what a correctly-spelled name looks
// like, and a re-spelled second copy is how two processes end up disagreeing
// about the same file.

/**
 * The name endings this tool reads meaning into, on top of a file's extension.
 * Longest first, so `.stories` is recognised before `.story` can claim part of
 * it.
 */
export const KNOWN_NAME_ENDINGS = [
	'.stories',
	'.story',
	'.component',
	'.decorator',
]

/**
 * The file name with its extension and any known endings lower-cased, and the
 * rest of the name left exactly as it was — so a component whose own name
 * carries a dot, like `Table.Row.tsx`, is returned untouched.
 *
 * Endings are peeled off one at a time because they stack: Angular's
 * `Button.Component.Stories.ts` has two, and fixing only the last one would
 * hand back a name still wrong in the middle.
 *
 * A name this returns unchanged is one the rest of the tool can match exactly,
 * which is what lets every other pattern spell one name and mean one file.
 */
export function getLowerCasedEndings(fileName: string): string {
	const lastDotIndex = fileName.lastIndexOf('.')
	const hasExtension = lastDotIndex > 0
	const extension = hasExtension ? fileName.slice(lastDotIndex) : ''
	let remainingName = hasExtension ? fileName.slice(0, lastDotIndex) : fileName
	let endings = ''
	let ending = getKnownNameEnding(remainingName)
	while (ending) {
		endings = ending + endings
		remainingName = remainingName.slice(0, -ending.length)
		ending = getKnownNameEnding(remainingName)
	}
	return remainingName + endings + extension.toLowerCase()
}

/** Which of `KNOWN_NAME_ENDINGS` this name ends with however it is capitalised, or `null` for none. */
function getKnownNameEnding(name: string): string | null {
	const comparableName = name.toLowerCase()
	return (
		KNOWN_NAME_ENDINGS.find((ending) => comparableName.endsWith(ending)) ?? null
	)
}
