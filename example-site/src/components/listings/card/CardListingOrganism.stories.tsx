import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { exampleMealList } from '../../../data/example-meal-data'
import {
	CardListingOrganism,
	type PropsForCardListingOrganism,
} from './CardListingOrganism'

const meta: Meta<typeof CardListingOrganism> = {
	title: 'Listings / Card / Card Listing Organism',
	component: CardListingOrganism,
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		cards: exampleMealList.map((meal) => ({
			title: meal.name,
			href: '/meal/$mealId',
			hrefParams: { mealId: meal.id },
			description: `${meal.area} ${meal.category} dish`,
			imgSrc: meal.image,
		})),
	} satisfies PropsForCardListingOrganism,
}
