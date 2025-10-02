import type { StoryInfo } from '../types'
import { linkTo } from '@storybook/addon-links'

import s from './StoryLink.module.css'
import type { ReactNode } from 'react'

interface StoryLinkProps {
	info: StoryInfo
	children?: ReactNode
}

export function StoryLink({ info, children }: StoryLinkProps) {
	if (!info.storyId) {
		return info.componentPath
	}
	const linkPath = `/?path=/docs/${info.storyId}`
	const brokenUpStoryTitle = info.storyTitle?.split('/')
	const reducedStoryTitle =
		brokenUpStoryTitle?.[brokenUpStoryTitle?.length! - 1]
	return (
		<a
			className={s.storyLink}
			href={linkPath}
			onClick={(e) => {
				e.preventDefault()
				linkTo(info.storyId!)(e)
			}}
		>
			{children ?? reducedStoryTitle}
		</a>
	)
}
