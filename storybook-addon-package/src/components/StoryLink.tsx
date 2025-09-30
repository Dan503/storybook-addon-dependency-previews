import type { StoryInfo } from '../types'
import { linkTo } from '@storybook/addon-links'

interface StoryLinkProps {
	info: StoryInfo
}

export function StoryLink({ info }: StoryLinkProps) {
	if (!info.storyId) {
		return info.componentPath
	}
	const linkPath = `/?path=/docs/${info.storyId}`
	return (
		<a
			href={linkPath}
			onClick={(e) => {
				e.preventDefault()
				linkTo(info.storyId!)(e)
			}}
		>
			{info.storyTitle}
		</a>
	)
}
