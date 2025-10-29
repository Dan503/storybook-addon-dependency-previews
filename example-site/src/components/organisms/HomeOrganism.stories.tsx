import type { Meta, StoryObj } from '@storybook/react-vite'
import { HomeOrganism, type PropsForHomeOrganism } from './HomeOrganism'
import { exampleMealList } from '../../data/example-meal-data'

const meta: Meta<typeof HomeOrganism> = {
	title: 'Organisms / Home Organism',
	component: HomeOrganism,
	tags: ['autodocs', 'organism'],
	parameters: {
		__filePath: import.meta.url,
		layout: 'fullscreen',
	},
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {
		mealList: exampleMealList,
	} satisfies PropsForHomeOrganism,
}
