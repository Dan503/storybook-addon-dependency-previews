// Shared by the watcher (`sb-deps.ts`) and the graph filter
// (`postprocess.ts`), which run as separate processes. The watcher checks a
// file's name as it is created; the graph filter checks the names it finds
// already on disk. Both have to agree on what a correctly-spelled name looks
// like, and a re-spelled second copy is how two processes end up disagreeing
// about the same file.

/**
 * The name endings this tool reads meaning into, on top of a file's extension.
 * Order does not matter: no entry is the ending of another, and they are
 * matched with `endsWith`, so `.story` can never claim part of a `.stories`
 * name.
 */
export const KNOWN_NAME_ENDINGS = [
	'.stories',
	'.story',
	'.component',
	'.decorator',
]

/** Is this file name spelled in a way the rest of the tool can't match exactly? */
export function checkIsNameWronglyCased(fileName: string): boolean {
	return getLowerCasedEndings(fileName) !== fileName
}

/**
 * The file name with its extension and any known endings lower-cased, and the
 * rest of the name left exactly as it was.
 *
 * That leaves a dotted name alone only when none of its dotted parts is one of
 * the endings above: `Table.Row.tsx` comes back untouched, while `My.Story.tsx`
 * becomes `My.story.tsx`.
 *
 * Endings are peeled off one at a time because they stack: Angular's
 * `Button.Component.Stories.ts` has two, and fixing only the last one would
 * hand back a name still wrong in the middle.
 *
 * A name this returns unchanged is one the rest of the tool can match exactly,
 * which is what lets its patterns spell one name and mean one file.
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
