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
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		meal: exampleMeal,
	} satisfies PropsForDetailPageTemplate,
}

export const Loading = {
	args: {
		meal: undefined,
		isLoading: true,
	} satisfies PropsForDetailPageTemplate,
}
