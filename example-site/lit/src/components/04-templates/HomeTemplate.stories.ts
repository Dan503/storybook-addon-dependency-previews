import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { html } from 'lit'
import { featuredMealsData } from 'example-site-shared/data'

// Imported twice on purpose: the first line runs the file, which is what
// registers the tag, and the second gives the story its type. An import used
// only as a type is dropped when the code is built, so without the first line
// the tag would never be registered.
import './HomeTemplate.lit'
import type { HomeTemplate } from './HomeTemplate.lit'

const meta: Meta<HomeTemplate> = {
	title: '04 Templates / Home Template',
	component: 'app-home-template',
	tags: ['autodocs', 'template'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	argTypes: {
		// Use mapping to prevent large data from being serialized into URL
		featuredMeals: {
			mapping: {
				featured: featuredMealsData,
			},
			control: {
				type: 'select',
			},
			options: ['featured'],
		},
	},
	render: (args) =>
		html`<app-home-template
			.featuredMeals=${args.featuredMeals}
		></app-home-template>`,
}

export default meta

type Story = StoryObj<HomeTemplate>

export const Primary: Story = {
	args: { featuredMeals: 'featured' as any },
}
