import type { Meta, StoryObj } from '@storybook/react-vite'
import {
	CompactListingMolecule,
	type PropsForCompactListingMolecule,
} from './CompactListingMolecule'
import { exampleIngredient } from 'example-site-shared/data'
import type { StoryParameters } from 'storybook-addon-dependency-previews'

const meta: Meta<typeof CompactListingMolecule> = {
	title: 'Listings / Compact / Compact Listing Molecule',
	component: CompactListingMolecule,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
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
