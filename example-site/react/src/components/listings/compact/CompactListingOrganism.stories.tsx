import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { ingredientItems } from 'example-site-shared/data'
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
	argTypes: {
		// Use mapping to prevent large data from being serialized into URL
		items: {
			mapping: {
				ingredients: ingredientItems,
			},
			control: {
				type: 'select',
			},
			options: ['ingredients'],
		},
	},
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		items: 'ingredients' as unknown as PropsForCompactListingOrganism['items'],
	},
}
