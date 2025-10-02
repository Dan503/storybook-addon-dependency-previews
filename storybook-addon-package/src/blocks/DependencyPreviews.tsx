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
import type { IconComponent } from '../components/icons/iconTypes'
import { SquaresPlus } from '../components/icons/SquaresPlus'

import s from './DependencyPreviews.module.css'
import { Heading } from '@storybook/blocks'

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

	const builtWith = filterOutStoryAndNonComponentFiles(node.builtWith)
	const usedIn = filterOutStoryAndNonComponentFiles(node.usedIn)

	return (
		<div className={s.topLevelWrapper}>
			<div className={s.sbHeading}>
				<Heading>Dependency previews</Heading>
			</div>
			<DepsPreviewBlock
				deps={builtWith}
				title="Built with"
				Icon={BuildIcon}
			/>
			<DepsPreviewBlock
				deps={usedIn}
				title="Used in"
				Icon={SquaresPlus}
			/>
		</div>
	)
}

interface DepsPreviewBlockProps {
	deps: Array<StoryInfo>
	title: string
	Icon: IconComponent
}

export function DepsPreviewBlock({ deps, title, Icon }: DepsPreviewBlockProps) {
	return (
		<Expandable
			Icon={Icon}
			Header={
				<h2>
					{title} {deps.length} component
					{plural(deps)}
				</h2>
			}
		>
			{deps.length ? (
				<ul>
					{deps.map((info) => (
						<DepsPreviewItem
							storyInfo={info}
							key={info.componentPath}
						/>
					))}
				</ul>
			) : (
				<p>—</p>
			)}
		</Expandable>
	)
}

interface PropsForDepsPreviewItem {
	storyInfo: StoryInfo
}

function DepsPreviewItem({ storyInfo }: PropsForDepsPreviewItem) {
	const { graph } = useDependencyGraph()
	const { builtWith, usedIn } = graph![storyInfo.componentPath]
	const filteredBuiltWith = filterOutStoryAndNonComponentFiles(builtWith)
	const filteredUsedIn = filterOutStoryAndNonComponentFiles(usedIn)

	return (
		<li key={storyInfo.componentPath}>
			{storyInfo.storyId ? (
				<Expandable Header={<StoryLink info={storyInfo} />}>
					{storyInfo.storyId && (
						<div>
							<ul style={{ marginBottom: '0.5em' }}>
								<li>
									<strong>Component path: </strong>
									<ComponentSourceLink
										storyInfo={storyInfo}
									/>
								</li>
								<li>
									<strong>Story path: </strong>
									<StoryLink info={storyInfo}>
										{storyInfo.storyTitle}
									</StoryLink>
								</li>
							</ul>

							<Expandable
								Header="Preview component"
								Icon={EyeOpen}
							>
								<PrimaryPreview storyInfo={storyInfo} />
							</Expandable>

							{filteredBuiltWith.length > 0 && (
								<Expandable
									Header={`Built with ${
										filteredBuiltWith.length
									} component${plural(filteredBuiltWith)}`}
									Icon={BuildIcon}
								>
									<ul>
										{filterOutStoryAndNonComponentFiles(
											builtWith,
										).map((info) => (
											<DepsPreviewItem
												storyInfo={info}
												key={info.componentPath}
											/>
										))}
									</ul>
								</Expandable>
							)}
							{filteredUsedIn.length > 0 && (
								<Expandable
									Header={`Used in ${
										filteredUsedIn.length
									} component${plural(filteredUsedIn)}`}
									Icon={SquaresPlus}
								>
									<ul>
										{filterOutStoryAndNonComponentFiles(
											usedIn,
										).map((info) => (
											<DepsPreviewItem
												storyInfo={info}
												key={info.componentPath}
											/>
										))}
									</ul>
								</Expandable>
							)}
						</div>
					)}
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
