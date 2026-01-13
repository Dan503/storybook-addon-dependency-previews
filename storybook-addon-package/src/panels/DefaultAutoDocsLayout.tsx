import {
	Controls,
	Description,
	Primary,
	Stories,
	Subtitle,
	Title,
} from '@storybook/addon-docs/blocks'
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
			{/*
				Placed DependencyPreviews above Controls because DependencyPreviews
				always takes up a small amount of space so it is fast to scroll past.
			*/}
			<DependencyPreviews />
			{/*
				Controls can take up a very large amount of vertical space
				which can take a lot of scrolling to get past
			*/}
			<Controls />
			<Stories />
		</>
	)
}

export const defaultPreviewParameters: StorybookParameters = {
	docs: {
		page: () => <DefaultAutoDocsLayout />,
	},
}
