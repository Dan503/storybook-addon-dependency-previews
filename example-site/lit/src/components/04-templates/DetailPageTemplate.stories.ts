import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { html } from 'lit'
import { exampleMeal } from 'example-site-shared/data'

// Imported twice on purpose: the first line runs the file, which is what
// registers the tag, and the second gives the story its type. An import used
// only as a type is dropped when the code is built, so without the first line
// the tag would never be registered.
import './DetailPageTemplate.lit'
import type { DetailPageTemplate } from './DetailPageTemplate.lit'

const meta: Meta<DetailPageTemplate> = {
	title: '04 Templates / Detail Page Template',
	component: 'app-detail-page-template',
	tags: ['autodocs', 'template'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	argTypes: {
		// Use mapping to prevent large data from being serialized into URL
		meal: {
			mapping: {
				example: exampleMeal,
				none: undefined,
			},
			control: {
				type: 'select',
			},
			options: ['example', 'none'],
		},
	},
	render: (args) =>
		html`<app-detail-page-template
			.meal=${args.meal}
			.isLoading=${args.isLoading}
		></app-detail-page-template>`,
}

export default meta

type Story = StoryObj<DetailPageTemplate>

export const Primary: Story = {
	args: { meal: 'example' as any },
}

export const Loading: Story = {
	args: { meal: null, isLoading: true },
}

export const NullMeal: Story = {
	name: 'Null meal',
	args: { meal: null, isLoading: false },
}
