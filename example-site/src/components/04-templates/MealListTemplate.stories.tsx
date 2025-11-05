import type { Meta, StoryObj } from '@storybook/react-vite'
import {
	MealListTemplate,
	type PropsForMealListTemplate,
} from './MealListTemplate'
import { exampleMealList } from '../../data/example-meal-data'
import type { StoryParameters } from 'storybook-addon-dependency-previews'

const meta: Meta<typeof MealListTemplate> = {
	title: '04 Templates / Meal List Template',
	component: MealListTemplate,
	tags: ['autodocs', 'template'],
	parameters: {
		__filePath: import.meta.url,
		layout: 'padded',
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {
		categoryName: 'chicken',
		mealList: exampleMealList,
	} satisfies PropsForMealListTemplate,
}
