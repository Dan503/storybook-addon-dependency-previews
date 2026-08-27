import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { featuredMealsData } from 'example-site-shared/data'
import HomeTemplate, { type PropsForHomeTemplate } from './HomeTemplate.vue'

const meta: Meta<typeof HomeTemplate> = {
	title: '04 Templates / Home Template',
	component: HomeTemplate,
	tags: ['autodocs', 'template'],
	parameters: {
		layout: 'fullscreen',
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
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		featuredMeals:
			'featured' as unknown as PropsForHomeTemplate['featuredMeals'],
	},
	render: (args) => ({
		components: { HomeTemplate },
		setup() {
			return { args }
		},
		template: `<HomeTemplate v-bind="args" />`,
	}),
}
