import { readdirSync } from 'node:fs'

// Shared by the watcher (`sb-deps.ts`) and the graph filter
// (`postprocess.ts`), which run as separate processes. The watcher turns away a
// wrongly-spelled name as the file is created; the graph filter reads the same
// endings to pair a component with its story. Both have to agree on what those
// endings mean, and a re-spelled second copy of the rule is how two processes
// end up disagreeing about the same file.

/** One name ending, and what has to be true for it to mean anything. */
type NameEnding = {
	ending: string
	/** Extensions the ending is read on, or `null` for any extension. */
	extensions: ReadonlyArray<string> | null
	needsAngularProject?: boolean
}

/**
 * The name endings this tool reads meaning into that are the same in every
 * project. `extensions: null` means any extension. Lit's component marker is
 * the one ending not listed here, because the project chooses what it is
 * spelled as — `getNameEnding` adds it from the context.
 *
 * An ending only earns attention where this tool would act on it, and what
 * establishes that differs by ending. `.decorator` is settled by the extension
 * alone, since only Svelte writes `.svelte` — so a NestJS `Roles.Decorator.ts`
 * is none of our business. `.component` is not: every framework here writes
 * `.ts`, so an `Auth.Component.ts` in a React project would be refused on
 * creation and named in every build afterwards for an Angular convention it
 * has nothing to do with. That one needs the project itself to be Angular, and
 * Lit's marker is read only in a Lit project for the same reason.
 *
 * Order does not matter: no entry is the ending of another, and they are
 * matched with `endsWith`, so `.story` can never claim part of a `.stories`
 * name.
 */
const NAME_ENDINGS: ReadonlyArray<NameEnding> = [
	{ ending: '.stories', extensions: null },
	{ ending: '.story', extensions: null },
	{
		ending: '.component',
		extensions: ['.ts', '.html'],
		needsAngularProject: true,
	},
	{ ending: '.decorator', extensions: ['.svelte'] },
]

/**
 * The words a project may not pick as its Lit component marker, because each
 * already means something here — a marker spelled `stories` would have
 * `Button.stories.ts` read as both a component and its own story.
 *
 * Derived from the endings above rather than listed again, so the two cannot
 * drift apart.
 */
const RESERVED_NAME_ENDINGS: ReadonlyArray<string> = NAME_ENDINGS.map((entry) =>
	entry.ending.slice('.'.length),
)

/**
 * Why this Lit component marker can't be used, or `null` when it can be.
 *
 * Phrased to follow the caller's own naming of the marker — `it can only
 * contain…`, not `"foo" can only contain…` — so that a caller which has
 * already quoted the value does not say it twice.
 *
 * Asked by the setup wizard of what the user typed, and by the watcher of what
 * the config file holds, so both refuse the same words. Anything this accepts
 * is safe to drop into a pattern as it stands: the characters it allows mean
 * nothing to one.
 *
 * @param marker - the marker without its dot, e.g. `"lit"`
 */
export function getComponentMarkerError(marker: string): string | null {
	if (!/^[A-Za-z0-9_-]+$/.test(marker))
		return 'it can only contain letters, digits, "_" and "-"'
	if (RESERVED_NAME_ENDINGS.includes(marker.toLowerCase()))
		return `it already means something to this tool; pick a word other than ${RESERVED_NAME_ENDINGS.map((word) => `"${word}"`).join(', ')}`
	return null
}

/** What the caller knows about the project, for the endings that need it. */
export type NameEndingContext = {
	isAngularProject: boolean
	/**
	 * What marks a Lit component file, with its dot (`'.lit'`), when the
	 * project is Lit and has a marker set. `null` otherwise — including in a
	 * Lit project that asked for no marker, where every plain `.ts` file is a
	 * component and so no ending distinguishes one.
	 */
	litComponentEnding: string | null
}

/**
 * `Button.component` → `Button`, for a name that carries an ending marking it
 * as a component file here — Angular's `.component`, or the Lit marker this
 * project set. Returned unchanged otherwise.
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
	// Both halves of the name have to be spelled in lower case already — the
	// ending, and the extension it is qualified by.
	//
	// `getNameEnding` ignores capitals in both, because its other caller exists
	// to FIND a wrong spelling in order to report it. Here the question is
	// whether to ACT on the ending, and a `Chart.Component.ts` or a
	// `Chart.component.TS` is a name the watcher refuses. Acting on either would
	// have the graph pair a file the rest of the tool does not recognise, which
	// is the disagreement this whole change exists to remove.
	if (extension !== extension.toLowerCase()) return baseName
	const ending = getNameEnding(baseName, extension.toLowerCase(), context)
	if (!ending) return baseName
	const isComponentMarkingEnding =
		ending === '.component' || ending === context.litComponentEnding
	if (!isComponentMarkingEnding) return baseName
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
 * `.decorator` is only read on `.svelte`, an `Auth.Component.ts` is untouched
 * outside an Angular project, and a `Button.Lit.ts` is untouched outside a Lit
 * project that set `lit` as its component marker.
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
	// The project's own Lit marker is added at the end rather than the start, so
	// that a name matching both it and a fixed ending is read as the fixed one.
	// The wizard and the config loader both refuse a marker spelled like one of
	// those, so that tie should be unreachable; ordering it this way means it
	// fails the safe way if it ever is not.
	const candidates: ReadonlyArray<NameEnding> = context.litComponentEnding
		? [
				...NAME_ENDINGS,
				{ ending: context.litComponentEnding, extensions: ['.ts'] },
			]
		: NAME_ENDINGS
	const match = candidates.find((candidate) => {
		if (!comparableName.endsWith(candidate.ending)) return false
		if (candidate.needsAngularProject && !context.isAngularProject) return false
		return candidate.extensions?.includes(comparableExtension) ?? true
	})
	return match?.ending ?? null
}
