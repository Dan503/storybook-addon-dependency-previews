import { useEffect, useMemo, useState } from 'react'
import type { CsfModule, StoryInfo, StoryModules } from '../types'
import { useStoryParams } from './useStoryParams'

// grab all stories; Vite will code-split them

// Normalise a graph-JSON `storyFilePath` to Vite’s absolute-style glob key shape
// (leading slash, forward slashes only, no leading `./` segments).
function normalizeStoryPath(p: string) {
	return '/' + p.replace(/^[./]+/, '').replace(/\\/g, '/')
}

function findStoryImporter(
	storiesGlob: StoryModules,
	storyFilePath: string | undefined | null,
) {
	if (!storyFilePath) {
		return null
	}
	const wanted = normalizeStoryPath(storyFilePath)
	// exact match first, else suffix match as a fallback
	return (
		storiesGlob[wanted] ||
		Object.entries(storiesGlob).find(([k]) => k.endsWith(wanted))?.[1]
	)
}

// Compose an actionable error for the "no story module matched" failure mode. The
// common cause — and the reason this helper exists — is the wizard-generated preview
// shipping the extglob syntax `@(a|b|c)` which silently returns zero matches under
// Vite 8 (tinyglobby). When the glob is empty, point the user at that fix; when the
// glob has keys but none match, show a sample so the path-format mismatch is visible.
function buildMissingStoryModuleError(
	storiesGlob: StoryModules,
	storyInfo: StoryInfo,
): string {
	const keys = Object.keys(storiesGlob)
	const rawPath = storyInfo.storyFilePath ?? '(no storyFilePath in graph entry)'
	const normalised = storyInfo.storyFilePath
		? normalizeStoryPath(storyInfo.storyFilePath)
		: '(n/a)'
	const lines = [
		`No story module found at this path: ${rawPath}`,
		`  Normalised lookup key: ${normalised}`,
		`  storyModules key count: ${keys.length}`,
	]
	if (keys.length === 0) {
		lines.push(
			'  Hint: your `import.meta.glob(...)` pattern matched zero files. If it uses',
			'        the extglob syntax `@(a|b|c)` you are likely on Vite 8 (tinyglobby),',
			'        which does not support extglob — switch to brace expansion',
			'        `{a,b,c}` instead. Example:',
			"        import.meta.glob('/src/**/*.{story,stories}.{tsx,ts,jsx,js,svelte}', { eager: false })",
		)
	} else {
		const sample = keys.slice(0, 10)
		lines.push(
			'  Sample storyModules keys (first 10):',
			...sample.map((k) => `    - ${k}`),
		)
		if (keys.length > sample.length) {
			lines.push(`    …and ${keys.length - sample.length} more`)
		}
	}
	return lines.join('\n')
}

export function useDynamicStory(storyInfo: StoryInfo) {
	const { dependencyPreviews } = useStoryParams()
	const modules = dependencyPreviews.storyModules
	const importer = useMemo(
		() => findStoryImporter(modules, storyInfo.storyFilePath),
		[modules, storyInfo.storyFilePath],
	)
	const [csfModule, setCsfModule] = useState<CsfModule | null>(null)
	const [err, setErr] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		let alive = true
		// Reset before kicking off the new load: PrimaryPreview checks `error` first,
		// so a stale error from a previous story would keep rendering even after a
		// successful import for the new one. Same logic for `csfModule` — clearing it
		// makes the loading state visible while the new module resolves.
		setIsLoading(true)
		setErr(null)
		setCsfModule(null)
		;(async () => {
			try {
				if (!importer)
					throw new Error(buildMissingStoryModuleError(modules, storyInfo))
				const mod = await importer()
				if (alive) setCsfModule(mod as CsfModule)
			} catch (e: any) {
				if (alive) setErr(e?.message || String(e))
			} finally {
				if (alive) setIsLoading(false)
			}
		})()
		return () => {
			alive = false
		}
	}, [importer, modules, storyInfo])

	const primaryExport = getPrimaryStoryExport(csfModule, storyInfo)
	const Component = csfModule?.default?.component
	const primaryId = storyInfo.storyId?.replace(
		/--docs$/,
		getPrimaryId(csfModule),
	)

	return {
		isLoading,
		primaryExport,
		primaryId,
		csfModule,
		Component,
		error: err,
	}
}

function getPrimaryId(csfModule: CsfModule | undefined | null) {
	if (!csfModule) return '--default'
	if ('Default' in csfModule) return '--default'
	if ('Primary' in csfModule) return '--primary'
	return (
		'--' + slugifyExportName(csfModule?.__namedExportsOrder?.[0] || 'default')
	)
}

// Kebab-case like Storybook: "ErrorStrings" -> "error-strings"
function slugifyExportName(name: string) {
	return (
		name
			// split camelCase / PascalCase boundaries
			.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
			.replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2') // ABCDef -> ABC-Def
			// underscores/spaces -> dashes
			.replace(/[_\s]+/g, '-')
			// strip anything not alnum or dash
			.replace(/[^a-zA-Z0-9-]/g, '-')
			// lowercase + collapse/trim dashes
			.toLowerCase()
			.replace(/--+/g, '-')
			.replace(/^-+|-+$/g, '')
	)
}

/** Choose a sensible story:
 *  1) If the module has `Primary`, use it.
 *  2) If we have a docs/primary id, try to match the export name in the id.
 *  3) Else fall back to the first named export.
 */
function getPrimaryStoryExport(mod: any, info?: StoryInfo) {
	if (!mod) return null

	// 1) Prefer "Default" or "Primary" if present
	if ('Default' in mod) return mod.Default
	if ('Primary' in mod) return mod.Primary

	// 2) If we have a storyId like "…--errorstrings", try to match export name
	if (info?.storyId && !info.storyId.endsWith('--docs')) {
		const exportName = info.storyId.split('--').pop() // e.g. "errorstrings"
		const match = Object.keys(mod).find(
			(k) => k !== 'default' && k.toLowerCase() === exportName,
		)
		if (match) return (mod as any)[match]
	}

	// 3) Fall back to first named export
	const order: string[] = mod.__namedExportsOrder || []
	const first = order.find((k) => k !== 'default')
	if (first && first in mod) return (mod as any)[first]

	// Last resort: any non-default function export
	const anyKey = Object.keys(mod).find(
		(k) => k !== 'default' && typeof mod[k] === 'function',
	)
	return anyKey ? (mod as any)[anyKey] : null
}
