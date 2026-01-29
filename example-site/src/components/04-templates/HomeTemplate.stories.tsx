import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { exampleMealList } from '../../data/example-meal-data'
import { HomeTemplate, type PropsForHomeTemplate } from './HomeTemplate'

// Pre-transform data to avoid serializing large objects into URL args
const featuredMealsData = exampleMealList.slice(0, 7)

const meta: Meta<typeof HomeTemplate> = {
	title: '04 Templates / Home Template',
	component: HomeTemplate,
	tags: ['autodocs', 'template'],
	parameters: {
		layout: 'fullscreen',
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
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		featuredMeals:
			'featured' as unknown as PropsForHomeTemplate['featuredMeals'],
	},
}
