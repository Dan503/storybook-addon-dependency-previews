import { PrimaryPreview } from '../components/PrimaryPreview'
import { StoryLink } from '../components/StoryLink'
import {
	DependencyGraphProvider,
	filterOutStoryAndNonComponentFiles,
	useDependencyGraph,
} from '../hooks/useDependencyGraph'
import type { StoryInfo } from '../types'

import { ComponentSourceLink } from '../components/ComponentSourceLink'
import { Expandable } from '../components/Expandable'
import { BuildIcon } from '../components/icons/BuildIcon'
import { EyeOpen } from '../components/icons/EyeOpen'
import { SquaresPlus } from '../components/icons/SquaresPlus'

import { Heading } from '@storybook/blocks'
import s from './DependencyPreviews.module.css'
import { ArrowToRectangle } from '../components/icons/ArrowToRectangleIcon'
import { CopyButton } from '../components/CopyButton'

export function DependencyPreviews() {
	return (
		<DependencyGraphProvider>
			<TopLevelDependencyPreviews />
		</DependencyGraphProvider>
	)
}

function TopLevelDependencyPreviews() {
	const { error, graph, node } = useDependencyGraph()
	if (error) return <div>Failed to load dependency previews: {error}</div>
	if (!graph) return <div>Loading dependency previews…</div>
	if (!node) return <div>No dependency previews for this component.</div>

	return (
		<div className={s.topLevelWrapper}>
			<div className={s.sbHeading}>
				<Heading>Dependency previews</Heading>
			</div>
			<DepsPreviewContent storyInfo={node} enablePreview={false} />
		</div>
	)
}

interface PropsForDepsPreviewContent {
	storyInfo: StoryInfo
	enablePreview?: boolean
}
function DepsPreviewContent({
	storyInfo,
	enablePreview = true,
}: PropsForDepsPreviewContent) {
	const { graph } = useDependencyGraph()
	const { builtWith, usedIn } = graph![storyInfo.componentPath]
	const filteredBuiltWith = filterOutStoryAndNonComponentFiles(builtWith)
	const filteredUsedIn = filterOutStoryAndNonComponentFiles(usedIn)

	return (
		<div>
			{enablePreview && (
				<Expandable Header="Preview component" Icon={EyeOpen}>
					<PrimaryPreview storyInfo={storyInfo} />
				</Expandable>
			)}

			<Expandable Header="Paths to component" Icon={ArrowToRectangle}>
				<div className={s.pathData}>
					<p className={s.pathDataItem}>
						<strong>Source file path: </strong>
						<br />
						<div className={s.pathLinkWrapper}>
							<CopyButton
								label="Copy source file path to clip board"
								copyMessage="Copied source file path"
								copyContent={storyInfo.componentPath}
							/>
							<ComponentSourceLink storyInfo={storyInfo} />
						</div>
					</p>
					<p className={s.pathDataItem}>
						<strong>Story path: </strong>
						<br />
						<div className={s.pathLinkWrapper}>
							<CopyButton
								label="Copy story path to clip board"
								copyMessage="Copied story path"
								copyContent={storyInfo.storyTitle!}
							/>
							<StoryLink info={storyInfo}>
								{storyInfo.storyTitle}
							</StoryLink>
						</div>
					</p>
				</div>
			</Expandable>

			{filteredBuiltWith.length > 0 && (
				<Expandable
					Header={`Built with ${
						filteredBuiltWith.length
					} component${plural(filteredBuiltWith)}`}
					Icon={BuildIcon}
				>
					<ul>
						{filterOutStoryAndNonComponentFiles(builtWith).map(
							(info) => (
								<DepsPreviewItem
									storyInfo={info}
									key={info.componentPath}
								/>
							),
						)}
					</ul>
				</Expandable>
			)}
			{filteredUsedIn.length > 0 && (
				<Expandable
					Header={`Used in ${filteredUsedIn.length} component${plural(
						filteredUsedIn,
					)}`}
					Icon={SquaresPlus}
				>
					<ul>
						{filterOutStoryAndNonComponentFiles(usedIn).map(
							(info) => (
								<DepsPreviewItem
									storyInfo={info}
									key={info.componentPath}
								/>
							),
						)}
					</ul>
				</Expandable>
			)}
		</div>
	)
}

interface PropsForDepsPreviewItem {
	storyInfo: StoryInfo
}

function DepsPreviewItem({ storyInfo }: PropsForDepsPreviewItem) {
	return (
		<li key={storyInfo.componentPath}>
			{storyInfo.storyId ? (
				<Expandable Header={<StoryLink info={storyInfo} />}>
					<DepsPreviewContent storyInfo={storyInfo} />
				</Expandable>
			) : (
				<StoryLink info={storyInfo} />
			)}
		</li>
	)
}

function plural(arr: Array<any>) {
	return arr.length === 1 ? '' : 's'
}
