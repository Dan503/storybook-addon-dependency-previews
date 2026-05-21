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

	return (
		<div className="grid grid-cols-1 grid-rows-1">
			{!hasLoaded && (
				<div className="col-start-1 row-start-1 grid place-items-center">
					<LoadingRipples />
				</div>
			)}
			<div className="col-start-1 row-start-1">
				<FullParityStory
					storyId={primaryId!}
					args={primaryExport.args}
					onLoad={() => setHasLoaded(true)}
				/>
			</div>
		</div>
	)
}
