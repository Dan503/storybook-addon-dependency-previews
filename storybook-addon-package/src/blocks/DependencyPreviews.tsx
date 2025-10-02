import { PrimaryPreview } from '../components/PrimaryPreview'
import { StoryLink } from '../components/StoryLink'
import {
	DependencyGraphProvider,
	filterOutStoryFiles,
	useDependencyGraph,
} from '../hooks/useDependencyGraph'
import type { StoryInfo } from '../types'

import s from './DependencyPreviews.module.css'
import { Expandable } from '../components/Expandable'

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

	const builtWith = filterOutStoryFiles(node.builtWith)
	const usedIn = filterOutStoryFiles(node.usedIn)

	return (
		<div className={s.topLevelWrapper}>
			<DepsPreviewBlock deps={builtWith} title="Built with" />
			<DepsPreviewBlock deps={usedIn} title="Used in" />
		</div>
	)
}

interface DepsPreviewBlockProps {
	deps: Array<StoryInfo>
	title: string
}

export function DepsPreviewBlock({ deps, title }: DepsPreviewBlockProps) {
	return (
		<Expandable
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
	const filteredBuiltWith = filterOutStoryFiles(builtWith)
	const fitleredUsedIn = filterOutStoryFiles(usedIn)

	return (
		<li key={storyInfo.componentPath}>
			{storyInfo.storyId ? (
				<Expandable Header={<StoryLink info={storyInfo} />}>
					{storyInfo.storyId && (
						<div>
							<Expandable Header="Preview component">
								<PrimaryPreview storyInfo={storyInfo} />
							</Expandable>

							{filteredBuiltWith.length > 0 && (
								<Expandable Header="Built with">
									<ul>
										{filterOutStoryFiles(builtWith).map(
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
							{fitleredUsedIn.length > 0 && (
								<Expandable Header="Used in">
									<ul>
										{filterOutStoryFiles(usedIn).map(
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
