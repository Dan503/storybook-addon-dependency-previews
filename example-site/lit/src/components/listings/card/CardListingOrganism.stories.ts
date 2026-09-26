import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { html } from 'lit'
import { mealCardsForSite } from '../../../lib/storyExampleCards'

// Imported twice on purpose: the first line runs the file, which is what
// registers the tag, and the second gives the story its type. An import used
// only as a type is dropped when the code is built, so without the first line
// the tag would never be registered.
import './CardListingOrganism.lit'
import type { CardListingOrganism } from './CardListingOrganism.lit'

const meta: Meta<CardListingOrganism> = {
	title: 'Listings / Card / Card Listing Organism',
	component: 'app-card-listing-organism',
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
	render: (args) =>
		html`<app-card-listing-organism
			.cards=${args.cards}
		></app-card-listing-organism>`,
}

export default meta

type Story = StoryObj<CardListingOrganism>

export const Primary: Story = {
	args: { cards: 'meals' as any },
}
