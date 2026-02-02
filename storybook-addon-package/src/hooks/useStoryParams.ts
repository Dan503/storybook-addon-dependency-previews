import { useOf } from '@storybook/addon-docs/blocks'
import type { DependencyPreviewStorybookParameters } from '../types'

export function useStoryParams(): DependencyPreviewStorybookParameters & {
	_storyId?: string
} {
	const resolved = useOf<'story'>('story')
	const story = resolved?.story
	// Get the story ID - this is the most reliable identifier available at runtime
	// It matches the storyId field in the dependency graph JSON
	const storyId = story?.id

	return {
		...(story?.parameters as DependencyPreviewStorybookParameters),
		_storyId: storyId,
	}
}
