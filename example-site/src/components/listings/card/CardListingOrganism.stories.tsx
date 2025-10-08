import type { Meta } from '@storybook/react-vite'
import {
	CardListingOrganism,
	type PropsForCardListingOrganism,
} from './CardListingOrganism'
import { exampleMealList } from '../../../data/example-meal-data'

const meta: Meta<typeof CardListingOrganism> = {
	title: 'Listings / Card / Card Listing Organism',
	component: CardListingOrganism,
	tags: ['autodocs', 'organism'],
	parameters: {
		__filePath: import.meta.url,
		layout: 'padded',
	},
}

export default meta

export const Default = {
	args: {
		cards: exampleMealList.map((meal) => ({
			title: meal.name,
			href: '/example-path',
			description: `${meal.area} ${meal.category} dish`,
			imgSrc: meal.image,
		})),
	} satisfies PropsForCardListingOrganism,
}
