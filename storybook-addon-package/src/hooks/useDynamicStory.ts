import { useEffect, useMemo, useState } from 'react'
import type { CsfModule, StoryInfo } from '../types'

// grab all stories; Vite will code-split them
const storiesGlob = import.meta.glob('/src/**/*.stories.@(tsx|ts|jsx|js)', {
	eager: false,
})

function findStoryImporter(storyFilePath: string | undefined | null) {
	if (!storyFilePath) {
		return null
	}
	// normalize to Vite’s absolute-style keys
	const norm = (p: string) =>
		'/' + p.replace(/^[./]+/, '').replace(/\\/g, '/')
	const wanted = norm(storyFilePath)
	console.log({ storiesGlob })
	// exact match first, else suffix match as a fallback
	return (
		storiesGlob[wanted] ||
		Object.entries(storiesGlob).find(([k]) => k.endsWith(wanted))?.[1]
	)
}

export function useDynamicStory(storyInfo: StoryInfo) {
	const importer = useMemo(
		() => findStoryImporter(storyInfo.storyPath),
		[storyInfo.storyPath],
	)
	const [csfModule, setCsfModule] = useState<CsfModule | null>(null)
	const [err, setErr] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		let alive = true
		setIsLoading(true)
		;(async () => {
			try {
				if (!importer)
					throw new Error(
						`No story module for ${storyInfo.componentPath}`,
					)
				const mod = await importer()
				if (alive) setCsfModule(mod as CsfModule)
			} catch (e: any) {
				if (alive) setErr(e?.message || String(e))
			} finally {
				setIsLoading(false)
			}
		})()
		return () => {
			alive = false
		}
	}, [importer, storyInfo.componentPath])

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
		'--' +
		slugifyExportName(csfModule?.__namedExportsOrder?.[0] || 'default')
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
