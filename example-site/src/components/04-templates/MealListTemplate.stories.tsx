import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { exampleMealList } from '../../data/example-meal-data'
import {
	MealListTemplate,
	type PropsForMealListTemplate,
} from './MealListTemplate'

const meta: Meta<typeof MealListTemplate> = {
	title: '04 Templates / Meal List Template',
	component: MealListTemplate,
	tags: ['autodocs', 'template'],
	parameters: {
		__filePath: import.meta.url,
		layout: 'fullscreen',
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
