import { useState } from 'react'
import { PrimaryPreview } from '../components/PrimaryPreview'
import { StoryLink } from '../components/StoryLink'
import {
	DependencyGraphProvider,
	filterOutStoryFiles,
	useDependencyGraph,
} from '../hooks/useDependencyGraph'
import type { StoryInfo } from '../types'

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
		<div className="grid gap-2">
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
		<details>
			<summary>
				<h2>
					{title} {deps.length} component
					{plural(deps)}
				</h2>
			</summary>

			<div>
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
			</div>
		</details>
	)
}

interface PropsForDepsPreviewItem {
	storyInfo: StoryInfo
}

function DepsPreviewItem({ storyInfo }: PropsForDepsPreviewItem) {
	const { graph } = useDependencyGraph()
	const { builtWith, usedIn } = graph![storyInfo.componentPath]
	const [isOpen, setIsOpen] = useState(false)
	const filteredBuiltWith = filterOutStoryFiles(builtWith)
	const fitleredUsedIn = filterOutStoryFiles(usedIn)

	return (
		<li key={storyInfo.componentPath}>
			{storyInfo.storyId ? (
				<details
					onToggle={(e) => {
						e.stopPropagation()
						setIsOpen((prev) => !prev)
					}}
				>
					<summary>
						<StoryLink info={storyInfo} />
					</summary>
					{isOpen && storyInfo.storyId && (
						<div>
							<PrimaryPreview storyInfo={storyInfo} />
							{filteredBuiltWith.length > 0 && (
								<>
									<p>Built with:</p>
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
								</>
							)}
							{fitleredUsedIn.length > 0 && (
								<>
									<p>Used in:</p>
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
								</>
							)}
						</div>
					)}
				</details>
			) : (
				<StoryLink info={storyInfo} />
			)}
		</li>
	)
}

function plural(arr: Array<any>) {
	return arr.length === 1 ? '' : 's'
}
