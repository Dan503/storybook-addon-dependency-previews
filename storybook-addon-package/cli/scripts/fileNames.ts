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
 * project. `extensions: null` means any extension. The project's component
 * marker (`componentFileSuffix`) is the one ending not listed here, because the
 * project chooses what it is spelled as — `getNameEnding` adds it from the
 * context.
 *
 * An ending only earns attention where this tool would act on it, and what
 * establishes that differs by ending. `.decorator` is settled by the extension
 * alone, since only Svelte writes `.svelte` — so a NestJS `Roles.Decorator.ts`
 * is none of our business. `.component` is not: every framework here writes
 * `.ts`, so an `Auth.Component.ts` in a React project would be refused on
 * creation and named in every build afterwards for an Angular convention it
 * has nothing to do with. That one needs the project itself to be Angular, and
 * the component marker is read only in a Lit project (on `.ts`) or a React,
 * Solid or Preact project (on `.tsx`) for the same reason.
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
 * The words a project may not pick as its component marker, because each
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
 * Why this component marker can't be used, or `null` when it can be.
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
 * **Capitals are refused rather than lower-cased**, because a marker is a name
 * ending and every ending here is read in lower case. A capital in one would be
 * honoured by the watcher, whose file-ending patterns are deliberately exact,
 * and missed by `getNameEnding` below, which compares a lower-cased name
 * against the ending as written — so the watcher would scaffold `Button.Lit.ts`
 * while the graph filter failed to pair it with its story, which is the precise
 * disagreement between the two processes this module exists to prevent.
 *
 * @param marker - the marker without its dot, e.g. `"lit"` or `"ui"`
 */
export function getComponentMarkerError(marker: string): string | null {
	if (!/^[a-z0-9_-]+$/.test(marker))
		return 'it can only contain lower-case letters, digits, "_" and "-"'
	// No `toLowerCase` here: the check above has already refused every capital,
	// so the marker is lower case by the time this runs.
	if (RESERVED_NAME_ENDINGS.includes(marker))
		return `it already means something to this tool; pick a word other than ${RESERVED_NAME_ENDINGS.map((word) => `"${word}"`).join(', ')}`
	return null
}

/** What the caller knows about the project, for the endings that need it. */
export type NameEndingContext = {
	isAngularProject: boolean
	/**
	 * The project's component marker, when it has one: the ending with its dot
	 * (`'.lit'`, `'.ui'`) and the one extension it is read on — `.ts` in a Lit
	 * project, `.tsx` in a React, Solid or Preact project. `null` otherwise,
	 * including in a project that asked for no marker, where no ending
	 * distinguishes a component file.
	 */
	componentEnding: ComponentEnding | null
}

/** A project's component marker and the extension it marks. */
export type ComponentEnding = {
	/** The marker with its dot, e.g. `'.lit'`. */
	ending: string
	extension: '.ts' | '.tsx'
}

/**
 * The project's component marker as a name ending, with the extension it marks
 * — or `null` when no marker is set, or the project is not one the marker
 * applies to. A Lit project marks `.ts` files; a React, Solid or Preact project
 * (the `react` family) marks `.tsx` files. Vue and Svelte need no marker, since
 * their extension already says "component", and Angular has its own
 * `.component`.
 *
 * Shared so the watcher and the graph filter agree on which projects read the
 * marker and on which extension.
 *
 * @param projectFamily - the project's framework family, e.g. `'lit'`, or `null`/`''` when unknown
 * @param marker - the marker without its dot, e.g. `'lit'`, or `null`/`''` for none
 */
export function getComponentMarkerEnding(
	projectFamily: string | null,
	marker: string | null,
): ComponentEnding | null {
	if (!marker) return null
	const ending = `.${marker}`
	if (projectFamily === 'lit') return { ending, extension: '.ts' }
	if (projectFamily === 'react') return { ending, extension: '.tsx' }
	return null
}

/**
 * `Button.component` → `Button`, for a name that carries an ending marking it
 * as a component file here — Angular's `.component`, or the component marker
 * this project set. Returned unchanged otherwise.
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
		ending === '.component' || ending === context.componentEnding?.ending
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
 * project that set `lit` as its component marker (as is a `Button.UI.tsx`
 * outside a React, Solid or Preact project that set `ui`).
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
	// The project's own component marker is added at the end rather than the
	// start, so that a name matching both it and a fixed ending is read as the
	// fixed one. The wizard and the config loader both refuse a marker spelled
	// like one of those, so that tie should be unreachable; ordering it this way
	// means it fails the safe way if it ever is not.
	const { componentEnding } = context
	const candidates: ReadonlyArray<NameEnding> = componentEnding
		? [
				...NAME_ENDINGS,
				{
					ending: componentEnding.ending,
					extensions: [componentEnding.extension],
				},
			]
		: NAME_ENDINGS
	const match = candidates.find((candidate) => {
		if (!comparableName.endsWith(candidate.ending)) return false
		if (candidate.needsAngularProject && !context.isAngularProject) return false
		return candidate.extensions?.includes(comparableExtension) ?? true
	})
	return match?.ending ?? null
}
