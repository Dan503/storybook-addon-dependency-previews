import { useOf } from '@storybook/blocks'
import type { StoryInfo } from '../types'

import s from './ComponentSourceLink.module.css'

interface Props {
	storyInfo: StoryInfo
}
export function ComponentSourceLink({ storyInfo }: Props) {
	const { story } = useOf<'story'>('story')
	const sourceRootUrl: string | undefined =
		story?.parameters?.dependencyPreviews?.sourceBaseUrl

	// Normalize: force POSIX slashes and strip leading ./ or /
	const relativePath = storyInfo.componentPath
		.replace(/\\/g, '/')
		.replace(/^\.?\/+/, '')

	if (!sourceRootUrl) {
		return <span>{relativePath}</span>
	}
	const href =
		(sourceRootUrl.endsWith('/') ? sourceRootUrl : sourceRootUrl + '/') +
		encodeURI(relativePath)

	return (
		<a
			className={s.ComponentSourceLink}
			href={href}
			target="_blank"
			rel="noreferrer"
		>
			{relativePath}
		</a>
	)
}
