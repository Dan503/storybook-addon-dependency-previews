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

export const defaultPreviewConfig: ProjectAnnotations<Renderer> = {
	parameters: {
		docs: {
			page: () => (
				<>
					<Title />
					<Subtitle />
					<Description />
					<Primary />
					<Controls />
					<DependencyPreviews />
					<Stories />
				</>
			),
		},
	},
}
