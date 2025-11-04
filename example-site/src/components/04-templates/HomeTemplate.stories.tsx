import type { Meta, StoryObj } from '@storybook/react-vite'
import { HomeTemplate, type PropsForHomeTemplate } from './HomeTemplate'
import { exampleMealList } from '../../data/example-meal-data'

const meta: Meta<typeof HomeTemplate> = {
	title: 'Templates / Home Template',
	component: HomeTemplate,
	tags: ['autodocs', 'template'],
	parameters: {
		__filePath: import.meta.url,
	},
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		mealList: exampleMealList,
	} satisfies PropsForHomeTemplate,
}
