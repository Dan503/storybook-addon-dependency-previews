import type { Meta } from '@storybook/react-vite'
import {
	MealDetailOrganism,
	type PropsForMealDetailOrganism,
} from './MealDetailOrganism'
import { exampleMeal } from '../data/example-meal-data'

const meta: Meta<typeof MealDetailOrganism> = {
	title: 'Meal Detail Organism',
	component: MealDetailOrganism,
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	},
}

export default meta

export const Default = {
	args: {
		meal: exampleMeal,
	} satisfies PropsForMealDetailOrganism,
}
