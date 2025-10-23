import type { StoryInfo } from '../types'

import s from './ComponentSourceLink.module.css'
import { TooltipTrigger } from './TooltipTrigger'
import { useStoryParams } from '../hooks/useStoryParams'

interface Props {
	storyInfo: StoryInfo
	ariaDescribedBy?: string
}
export function ComponentSourceLink({ storyInfo, ariaDescribedBy }: Props) {
	const storyParameters = useStoryParams()
	const sourceRootUrl = storyParameters?.dependencyPreviews?.sourceBaseUrl

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
		<TooltipTrigger
			TriggerElem="a"
			className={s.ComponentSourceLink}
			href={href}
			newWindow
			aria-describedby={ariaDescribedBy}
			tooltipText="View source (opens in new tab)"
			dangerouslySetInnerHTML={{
				// allow line breaks on slashes
				__html: relativePath.replaceAll('/', '/<wbr/>'),
			}}
		/>
	)
}
