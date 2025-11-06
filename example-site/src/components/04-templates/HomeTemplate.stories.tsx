import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { categoryList, exampleMealList } from '../../data/example-meal-data'
import { HomeTemplate, type PropsForHomeTemplate } from './HomeTemplate'

const meta: Meta<typeof HomeTemplate> = {
	title: '04 Templates / Home Template',
	component: HomeTemplate,
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
		categoryList: categoryList,
		randomMeal: exampleMealList[0],
	} satisfies PropsForHomeTemplate,
}
