import React from 'react'
import {
	Title,
	Subtitle,
	Description,
	Primary,
	Controls,
	Stories,
} from '@storybook/blocks'
import { DependencyPreviews } from 'storybook-addon-dependency-previews'
import type { ProjectAnnotations } from '@storybook/types'
import type { Renderer } from 'storybook/internal/csf'

const preview: ProjectAnnotations<Renderer> = {
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

export default preview
