import { Story } from '@storybook/blocks'
import type { StoryInfo } from '../types'
import { StoryLink } from './StoryLink'
import { PrimaryPreview } from './PrimaryPreview'

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
						{deps.map((f) => (
							<li key={f.componentPath}>
								<StoryLink info={f} />
								{f.storyId && <PrimaryPreview storyInfo={f} />}
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
