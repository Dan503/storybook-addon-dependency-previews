import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { html } from 'lit'
import { ingredientItems } from 'example-site-shared/data'

// Imported twice on purpose: the first line runs the file, which is what
// registers the tag, and the second gives the story its type. An import used
// only as a type is dropped when the code is built, so without the first line
// the tag would never be registered.
import './CompactListingOrganism.lit'
import type { CompactListingOrganism } from './CompactListingOrganism.lit'

const meta: Meta<CompactListingOrganism> = {
	title: 'Listings / Compact / Compact Listing Organism',
	component: 'app-compact-listing-organism',
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
	render: (args) =>
		html`<app-compact-listing-organism
			.items=${args.items}
		></app-compact-listing-organism>`,
}

export default meta

type Story = StoryObj<CompactListingOrganism>

export const Primary: Story = {
	args: { items: 'ingredients' as any },
}
