import { useOf } from '@storybook/addon-docs/blocks'
import type { DependencyPreviewStorybookParameters } from '../types'

export function useStoryParams(): DependencyPreviewStorybookParameters & {
	_componentPath?: string
} {
	const resolved = useOf<'story'>('story')
	const story = resolved?.story
	// Get componentPath from the story's index entry if available
	// This is more reliable than import.meta.url in production builds
	const componentPath = (story as any)?.componentPath

	return {
		...(story?.parameters as DependencyPreviewStorybookParameters),
		_componentPath: componentPath,
	}
}
