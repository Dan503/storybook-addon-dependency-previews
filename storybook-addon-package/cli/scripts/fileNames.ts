import { readdirSync } from 'node:fs'

// Shared by the watcher (`sb-deps.ts`) and the graph filter
// (`postprocess.ts`), which run as separate processes. The watcher turns away a
// wrongly-spelled name as the file is created; the graph filter reads the same
// endings to pair a component with its story. Both have to agree on what those
// endings mean, and a re-spelled second copy of the rule is how two processes
// end up disagreeing about the same file.

/**
 * The name endings this tool reads meaning into, with what has to be true for
 * each to mean anything. `extensions: null` means any extension.
 *
 * An ending only earns attention where this tool would act on it, and what
 * establishes that differs by ending. `.decorator` is settled by the extension
 * alone, since only Svelte writes `.svelte` — so a NestJS `Roles.Decorator.ts`
 * is none of our business. `.component` is not: every framework here writes
 * `.ts`, so an `Auth.Component.ts` in a React project would be refused on
 * creation and named in every build afterwards for an Angular convention it
 * has nothing to do with. That one needs the project itself to be Angular.
 *
 * Order does not matter: no entry is the ending of another, and they are
 * matched with `endsWith`, so `.story` can never claim part of a `.stories`
 * name.
 */
const NAME_ENDINGS: ReadonlyArray<{
	ending: string
	extensions: ReadonlyArray<string> | null
	needsAngularProject?: boolean
}> = [
	{ ending: '.stories', extensions: null },
	{ ending: '.story', extensions: null },
	{
		ending: '.component',
		extensions: ['.ts', '.html'],
		needsAngularProject: true,
	},
	{ ending: '.decorator', extensions: ['.svelte'] },
]

/** What the caller knows about the project, for the endings that need it. */
export type NameEndingContext = { isAngularProject: boolean }

/**
 * `Button.component` → `Button`, for a name that carries a `.component` ending
 * meaning something here. Returned unchanged otherwise.
 *
 * Exported so the graph filter asks the same question the watcher does. It used
 * to strip with an inline `/\.component$/`, which carried neither of the two
 * conditions above — so the rule crossed over one half at a time, and an
 * AngularJS-era `Chart.component.js` in an Angular project was still read as a
 * component file.
 */
export function stripComponentEnding(
	baseName: string,
	extension: string,
	context: NameEndingContext,
): string {
	const ending = getNameEnding(baseName, extension.toLowerCase(), context)
	if (ending !== '.component') return baseName
	// Only an ending already spelled in lower case. `getNameEnding` ignores
	// capitals because its other caller exists to FIND a wrong spelling in order
	// to report it — but here the question is whether to act on the ending, and
	// a `Chart.Component.ts` is a name the watcher refuses. Stripping it would
	// have the graph pair a file the rest of the tool does not recognise, which
	// is the disagreement this whole change exists to remove.
	if (!baseName.endsWith(ending)) return baseName
	return baseName.slice(0, -ending.length)
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
 * ending that means something here — on this extension, and for this project's
 * framework. `Table.Row.tsx` comes back untouched, `My.Story.tsx` becomes
 * `My.story.tsx`, a NestJS `Roles.Decorator.ts` is untouched because
 * `.decorator` is only read on `.svelte`, and an `Auth.Component.ts` is
 * untouched outside an Angular project.
 *
 * Endings are peeled off one at a time because they stack: Angular's
 * `Button.Component.Stories.ts` has two, and fixing only the last one would
 * hand back a name still wrong in the middle.
 *
 * A name this returns unchanged is one the rest of the tool can match exactly,
 * which is what lets its patterns spell one name and mean one file.
 */
export function getNameWithLowerCasedEndings(
	fileName: string,
	context: NameEndingContext,
): string {
	const lastDotIndex = fileName.lastIndexOf('.')
	const hasExtension = lastDotIndex > 0
	const extension = hasExtension ? fileName.slice(lastDotIndex) : ''
	const comparableExtension = extension.toLowerCase()
	let remainingName = hasExtension ? fileName.slice(0, lastDotIndex) : fileName
	let endings = ''
	let ending = getNameEnding(remainingName, comparableExtension, context)
	while (ending) {
		endings = ending + endings
		remainingName = remainingName.slice(0, -ending.length)
		ending = getNameEnding(remainingName, comparableExtension, context)
	}
	return remainingName + endings + comparableExtension
}

/** Which ending this name carries that means something here, however it is capitalised, or `null` for none. */
function getNameEnding(
	name: string,
	comparableExtension: string,
	context: NameEndingContext,
): string | null {
	const comparableName = name.toLowerCase()
	const match = NAME_ENDINGS.find((candidate) => {
		if (!comparableName.endsWith(candidate.ending)) return false
		if (candidate.needsAngularProject && !context.isAngularProject) return false
		return candidate.extensions?.includes(comparableExtension) ?? true
	})
	return match?.ending ?? null
}
