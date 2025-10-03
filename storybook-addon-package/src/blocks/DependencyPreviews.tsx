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
import { ArrowToRectangle } from '../components/icons/ArrowToRectangleIcon'
import { PathCopyMolecule } from '../components/PathCopyMolecule'
import s from './DependencyPreviews.module.css'
import { useId } from 'react'

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
					<PathCopyMolecule
						label="Source File Path"
						copyContent={storyInfo.componentPath}
					>
						<ComponentSourceLink storyInfo={storyInfo} />
					</PathCopyMolecule>

					<PathCopyMolecule
						label="Story Title Path"
						copyContent={storyInfo.storyTitle!}
					>
						<StoryLink info={storyInfo}>
							<span
								dangerouslySetInnerHTML={{
									// allow line breaks on slashes
									__html: storyInfo.storyTitle!.replaceAll(
										'/',
										'/<wbr/>',
									),
								}}
							/>
						</StoryLink>
					</PathCopyMolecule>

					<PathCopyMolecule
						label="Story Page ID"
						copyContent={storyInfo.storyId!}
					>
						<StoryLink info={storyInfo}>
							{storyInfo.storyId}
						</StoryLink>
					</PathCopyMolecule>
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
