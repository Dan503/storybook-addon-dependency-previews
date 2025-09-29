import type { ComponentInfo } from '../types'
import { StoryLink } from './StoryLink'

interface DepsPreviewBlockProps {
	deps: Array<ComponentInfo>
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
						{deps.map((f) => (
							<li key={f.path}>
								<StoryLink info={f} />
							</li>
						))}
					</ul>
				) : (
					<p>—</p>
				)}
			</div>
		</details>
	)
}

function plural(arr: Array<any>) {
	return arr.length === 1 ? '' : 's'
}
