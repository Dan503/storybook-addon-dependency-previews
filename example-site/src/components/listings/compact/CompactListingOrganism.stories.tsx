import type { Meta, StoryObj } from '@storybook/react-vite'
import {
	CompactListingOrganism,
	type PropsForCompactListingOrganism,
} from './CompactListingOrganism'
import { exampleIngredientList } from '../../../data/example-meal-data'

const meta: Meta<typeof CompactListingOrganism> = {
	title: 'Listings / Compact / Compact Listing Organism',
	component: CompactListingOrganism,
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	},
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		items: exampleIngredientList.map((ingredient) => ({
			title: ingredient.ingredient,
			imageSrc: ingredient.imageUrl.small,
			description: ingredient.amount,
		})),
	} satisfies PropsForCompactListingOrganism,
}
