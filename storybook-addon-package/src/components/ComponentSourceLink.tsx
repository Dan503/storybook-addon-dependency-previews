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

	const isLocalHost =
		window?.location.hostname === 'localhost' ||
		window?.location.hostname === '127.0.0.1'

	const vsCodeRootUrl = getVsCodeRootUrl(
		storyParameters.dependencyPreviews.projectRootPath,
	)
	const gitRootUrl = storyParameters.dependencyPreviews.sourceRootUrl

	const sourceRootUrl = isLocalHost ? vsCodeRootUrl : gitRootUrl

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
			tooltipText={`View source (opens in ${
				isLocalHost ? 'VS Code' : 'new tab'
			})`}
			dangerouslySetInnerHTML={{
				// allow line breaks on slashes
				__html: relativePath.replaceAll('/', '/<wbr/>'),
			}}
		/>
	)
}

function getVsCodeRootUrl(projectRootPath: string) {
	let newProjectRootPath = projectRootPath

	// Remove Vite's /@fs/ prefix if present
	newProjectRootPath = projectRootPath.replace(/^\/@fs\//, '/')

	// Fix Windows path: remove leading slash from /C:/Users/... -> C:/Users/...
	if (newProjectRootPath.match(/^\/[A-Za-z]:\//)) {
		newProjectRootPath = newProjectRootPath.slice(1)
	}

	// Ensure forward slashes for VS Code (works on all platforms)
	newProjectRootPath = newProjectRootPath.replace(/\\/g, '/')

	return `vscode://file/${newProjectRootPath}`
}
