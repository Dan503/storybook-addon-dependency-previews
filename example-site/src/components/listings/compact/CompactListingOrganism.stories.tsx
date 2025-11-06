import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { exampleIngredientList } from '../../../data/example-meal-data'
import {
	CompactListingOrganism,
	type PropsForCompactListingOrganism,
} from './CompactListingOrganism'

const meta: Meta<typeof CompactListingOrganism> = {
	title: 'Listings / Compact / Compact Listing Organism',
	component: CompactListingOrganism,
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
		items: exampleIngredientList.map((ingredient) => ({
			title: ingredient.ingredient,
			imageSrc: ingredient.imageUrl.small,
			description: ingredient.amount,
		})),
	} satisfies PropsForCompactListingOrganism,
}
