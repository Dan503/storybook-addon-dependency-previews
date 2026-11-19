import { exampleMealList } from 'example-site-shared/data'
import type { Meta, StoryObj } from '../../../storybook-only/storybook.types'
import ListingPage from './ListingPage.astro'
import { getMealCard } from '../../../../5-entities/meal/lib/getMealCard'

export default {
	component: ListingPage,
} satisfies Meta<typeof ListingPage>

type Story = StoryObj<typeof ListingPage>

export const Default: Story = {
	args: {
		title: 'Listing page title',
		cards: exampleMealList.map(getMealCard),
	},
}

export const WithDescription: Story = {
	args: {
		title: 'Listing page title',
		description: 'This is a description',
		cards: exampleMealList.map(getMealCard),
	},
}
