import type { Meta, StoryObj } from '@storybook/preact-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { mealCardsForSite } from '../../../lib/storyExampleCards'
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
	argTypes: {
		// Use mapping to prevent large data from being serialized into URL
		cards: {
			mapping: {
				meals: mealCardsForSite,
			},
			control: {
				type: 'select',
			},
			options: ['meals'],
		},
	},
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		cards: 'meals' as unknown as PropsForCardListingOrganism['cards'],
	},
}
