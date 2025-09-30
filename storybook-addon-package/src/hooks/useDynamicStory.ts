import type { ModuleExport } from '@storybook/types'
import { useEffect, useMemo, useState } from 'react'
import type { StoryInfo } from '../types'
import type {
	ComponentAnnotations,
	Meta,
	Renderer,
} from 'storybook/internal/csf'

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
	const [csfModule, setCsfModule] = useState<CsfStoryModule | null>(null)
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
				if (alive) setCsfModule(mod as CsfStoryModule)
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

	const primaryExport = pickStoryExport(csfModule, storyInfo)
	const Component = csfModule?.default.component

	if (csfModule) {
		console.log('csfModule', csfModule)
		console.log('keys', Object.keys(csfModule))
		console.log('default', csfModule.default)
		console.log('title', csfModule?.default?.title)
	}

	return {
		isLoading,
		primaryExport,
		csfModule,
		Component,
		error: err,
	}
}

interface StoryMeta {
	component: Renderer
	parameters: {
		__filePath?: string
	}
	tags: Array<string>
	title: string
}

type CsfStoryModule = Record<string, ComponentAnnotations<any>> & {
	default: StoryMeta
	tags: Array<string>
}

/** Choose a sensible story:
 *  1) If the module has `Primary`, use it.
 *  2) If we have a docs/primary id, try to match the export name in the id.
 *  3) Else fall back to the first named export.
 */
function pickStoryExport(mod: any, info?: { storyId?: string }) {
	if (!mod) return null

	// 1) Prefer Primary if present
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
