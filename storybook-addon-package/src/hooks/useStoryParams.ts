import { useOf } from '@storybook/blocks'
import type { DependencyPreviewStorybookParameters } from '../types'

export function useStoryParams(): DependencyPreviewStorybookParameters {
	const { story } = useOf<'story'>('story')
	return story?.parameters as DependencyPreviewStorybookParameters
}
