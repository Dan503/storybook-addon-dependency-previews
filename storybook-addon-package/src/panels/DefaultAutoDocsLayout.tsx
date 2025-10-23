import {
	Controls,
	Description,
	Primary,
	Stories,
	Subtitle,
	Title,
} from '@storybook/blocks'
import { DependencyPreviews } from '../blocks'
import type { StorybookParameters } from '../types'

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

export const defaultPreviewParameters: StorybookParameters = {
	docs: {
		page: () => <DefaultAutoDocsLayout />,
	},
}
