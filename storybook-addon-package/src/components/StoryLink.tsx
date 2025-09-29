import type { ComponentInfo } from '../types'
import { linkTo } from '@storybook/addon-links'

interface StoryLinkProps {
	info: ComponentInfo
}

export function StoryLink({ info }: StoryLinkProps) {
	if (!info.storyId) {
		return info.path
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
