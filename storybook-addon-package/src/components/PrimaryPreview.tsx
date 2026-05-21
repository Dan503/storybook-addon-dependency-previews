import React, { useState } from 'react'
import { useDynamicStory } from '../hooks/useDynamicStory'
import type { StoryInfo } from '../types'
import { FullParityStory } from './FullParityStory'
import { LoadingRipples } from './icons/LoadingRipples'

interface PropsForPrimaryPreview {
	storyInfo: StoryInfo
}

export function PrimaryPreview({ storyInfo }: PropsForPrimaryPreview) {
	const [hasLoaded, setHasLoaded] = useState(false)
	const { csfModule, primaryExport, primaryId, error, isLoading } =
		useDynamicStory(storyInfo)
	const message =
		error ||
		(isLoading && 'Loading preview…') ||
		(!csfModule && 'Module could not be loaded.') ||
		(!primaryExport && 'No story export found.')

	// `pre-wrap` preserves the line breaks in multi-line diagnostics like the
	// `buildMissingStoryModuleError` output (lookup key, key count, sample keys).
	// Single-line statuses ("Loading preview…", "Module could not be loaded.")
	// render identically either way.
	if (message)
		return (
			<p style={{ opacity: 0.7, whiteSpace: 'pre-wrap' }}>{message}</p>
		)

	// While the iframe is still loading, collapse its wrapper to zero height so
	// FullParityStory's default-sized empty bordered box doesn't render as a big
	// blank panel. The iframe itself is still in the DOM and loads normally —
	// height:0/overflow:hidden just clips its visual footprint until iframe-resizer
	// measures the real content and `onLoad` flips `hasLoaded` to true.
	//
	// Inline styles intentionally — earlier Tailwind grid classes (grid-cols-1,
	// place-items-center) only resolve when the consumer's Tailwind config scans
	// the addon's dist, which most installs don't. Inline styles ship in the bundle
	// and work in every consumer regardless of CSS toolchain.
	return (
		<div>
			{!hasLoaded && (
				<div
					style={{
						display: 'grid',
						placeItems: 'center',
						padding: '2rem 0',
					}}
				>
					<LoadingRipples />
				</div>
			)}
			<div
				style={{
					height: hasLoaded ? 'auto' : 0,
					overflow: 'hidden',
				}}
			>
				<FullParityStory
					storyId={primaryId!}
					args={primaryExport.args}
					onLoad={() => setHasLoaded(true)}
				/>
			</div>
		</div>
	)
}
