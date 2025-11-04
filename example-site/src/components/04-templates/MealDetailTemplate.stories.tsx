import type { Meta, StoryObj } from '@storybook/react-vite'
import {
	MealDetailTemplate,
	type PropsForMealDetailTemplate,
} from './MealDetailTemplate'
import { exampleMeal } from '../../data/example-meal-data'

const meta: Meta<typeof MealDetailTemplate> = {
	title: '04 Templates / Meal Detail Template',
	component: MealDetailTemplate,
	tags: ['autodocs', 'template'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	},
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		meal: exampleMeal,
	} satisfies PropsForMealDetailTemplate,
}

export const Loading = {
	args: {
		meal: undefined,
		isLoading: true,
	} satisfies PropsForMealDetailTemplate,
}
