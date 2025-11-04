import type { Meta, StoryObj } from '@storybook/react-vite'
import {
	CompactListingMolecule,
	type PropsForCompactListingMolecule,
} from './CompactListingMolecule'
import { exampleIngredient } from '../../../data/example-meal-data'

const meta: Meta<typeof CompactListingMolecule> = {
	title: 'Listings / Compact / Compact Listing Molecule',
	component: CompactListingMolecule,
	tags: ['autodocs', 'molecule'],
	parameters: {
		__filePath: import.meta.url,
	},
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		title: exampleIngredient.ingredient,
		imageSrc: exampleIngredient.imageUrl.small,
		description: exampleIngredient.amount,
	} satisfies PropsForCompactListingMolecule,
}
