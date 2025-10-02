import {
	Controls,
	Description,
	Primary,
	Stories,
	Subtitle,
	Title,
} from '@storybook/blocks'
import { DependencyPreviews } from '../blocks'
import type { ProjectAnnotations, Renderer } from '@storybook/types'

export { DependencyPreviews }

export function DefaultAutoDocsLayout() {
	return (
		<>
			<Title />
			<Subtitle />
			<Description />
			<Primary />
			<Controls />
			<DependencyPreviews />
			<Stories />
		</>
	)
}

export const defaultPreviewParameters: ProjectAnnotations<Renderer>['parameters'] =
	{
		docs: {
			page: () => <DefaultAutoDocsLayout />,
		},
	}
