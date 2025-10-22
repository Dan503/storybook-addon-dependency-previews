import type { StoryInfo } from '../types'
import { linkTo } from '@storybook/addon-links'

import s from './StoryLink.module.css'
import type { ReactNode } from 'react'
import { TooltipTrigger, type TooltipPosition } from './TooltipTrigger'

interface StoryLinkProps {
	info: StoryInfo
	children?: ReactNode
	tooltipPosition?: TooltipPosition
}

export function StoryLink({
	info,
	children,
	tooltipPosition = 'top',
}: StoryLinkProps) {
	if (!info.storyId) {
		return info.componentPath
	}
	const currentStoryId = /id=(.+?)&globals/.exec(window.location.href)?.[1]
	const linkPath = `/?path=/docs/${info.storyId}`
	const storyTitle = info.storyTitle

	if (info.storyId === currentStoryId) {
		return (
			<span className={s.currentStory}>
				{children ?? storyTitle}{' '}
				<strong className={s.currentStoryMark}>
					(Current Story Page)
				</strong>
			</span>
		)
	}

	return (
		<TooltipTrigger
			TriggerElem="a"
			tooltipText="View story"
			className={s.storyLink}
			href={linkPath}
			tooltipPosition={tooltipPosition}
			onClick={(e) => {
				e.preventDefault()
				linkTo(info.storyId!)(e)
			}}
		>
			{children ?? storyTitle}
		</TooltipTrigger>
	)
}
