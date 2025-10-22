import { useDynamicStory } from '../hooks/useDynamicStory'
import type { StoryInfo } from '../types'
import { FullParityStory } from './FullParityStory'

interface PropsForPrimaryPreview {
	storyInfo: StoryInfo
}

export function PrimaryPreview({ storyInfo }: PropsForPrimaryPreview) {
	const { csfModule, primaryExport, primaryId, error, isLoading } =
		useDynamicStory(storyInfo)
	const message =
		error ||
		(isLoading && 'Loading preview…') ||
		(!csfModule && 'Module could not be loaded.') ||
		(!primaryExport && 'No story export found.')

	if (message) return <p style={{ opacity: 0.7 }}>{message}</p>

	console.log({ primaryExport, csfModule })

	return <FullParityStory storyId={primaryId!} args={primaryExport.args} />
}
