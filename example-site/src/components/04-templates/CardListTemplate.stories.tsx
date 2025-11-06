import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { exampleMealList } from '../../data/example-meal-data'
import {
	CardListTemplate,
	type PropsForCardListTemplate,
} from './CardListTemplate'

const meta: Meta<typeof CardListTemplate> = {
	title: '04 Templates / Meal List Template',
	component: CardListTemplate,
	tags: ['autodocs', 'template'],
	parameters: {
		__filePath: import.meta.url,
		layout: 'fullscreen',
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		title: 'Delicious chicken dishes',
		introText:
			'Explore our curated selection of mouth-watering chicken recipes that are sure to satisfy your cravings.',
		mealList: exampleMealList,
	} satisfies PropsForCardListTemplate,
}
