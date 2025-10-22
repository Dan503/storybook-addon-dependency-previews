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

type StorybookParameters = ProjectAnnotations<Renderer>['parameters']

export const defaultPreviewParameters: StorybookParameters = {
	docs: {
		page: () => <DefaultAutoDocsLayout />,
	},
}

export type DependencyPreviewStorybookParameters = StorybookParameters & {
	layout: 'centered' | 'padded' | 'fullscreen'
	/** Preview settings used by the dependency-previews storybook add-on */
	dependencyPreviews: {
		/**
		 * Point to the root folder of your project source control.
		 *
		 * This allows the addon to link to the source code of your components.
		 *
		 * @example "https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/example-site"
		 */
		sourceBaseUrl: string
	}
}

export type StorybookPreviewConfig = ProjectAnnotations<Renderer> & {
	parameters: DependencyPreviewStorybookParameters
}
