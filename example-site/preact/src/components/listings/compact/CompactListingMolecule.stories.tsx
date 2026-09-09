import type { Meta, StoryObj } from '@storybook/preact-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { exampleIngredient } from 'example-site-shared/data'
import {
	CompactListingMolecule,
	type PropsForCompactListingMolecule,
} from './CompactListingMolecule'

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

export const AsALink: Story = {
	args: {
		title: exampleIngredient.ingredient,
		imageSrc: exampleIngredient.imageUrl.small,
		description: exampleIngredient.amount,
		href: '/categories',
	} satisfies PropsForCompactListingMolecule,
}
