import type { StoryInfo } from '../types'
import { linkTo } from '@storybook/addon-links'

import s from './StoryLink.module.css'

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
			className={s.storyLink}
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
