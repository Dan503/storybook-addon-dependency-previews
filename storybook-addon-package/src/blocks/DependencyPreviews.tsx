import { DepsPreviewBlock } from '../components/DepsPreviewBlock'
import {
	DependencyGraphProvider,
	filterOutStoryFiles,
	useDependencyGraph,
} from '../hooks/useDependencyGraph'

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
