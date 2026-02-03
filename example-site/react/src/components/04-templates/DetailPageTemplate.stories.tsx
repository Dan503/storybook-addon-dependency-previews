import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { exampleMeal } from '../../data/example-meal-data'
import {
	DetailPageTemplate,
	type PropsForDetailPageTemplate,
} from './DetailPageTemplate'

const meta: Meta<typeof DetailPageTemplate> = {
	title: '04 Templates / Meal Detail Template',
	component: DetailPageTemplate,
	tags: ['autodocs', 'template'],
	parameters: {
		layout: 'fullscreen',
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
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		meal: 'example' as unknown as PropsForDetailPageTemplate['meal'],
	},
}

export const Loading: Story = {
	args: {
		meal: 'none' as unknown as PropsForDetailPageTemplate['meal'],
		isLoading: true,
	},
}
