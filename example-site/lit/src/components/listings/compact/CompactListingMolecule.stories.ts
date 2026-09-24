import type { Meta, StoryObj } from '@storybook/web-components-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { html } from 'lit'
import { exampleIngredient } from 'example-site-shared/data'

// Imported twice on purpose: the first line runs the file, which is what
// registers the tag, and the second gives the story its type. An import used
// only as a type is dropped when the code is built, so without the first line
// the tag would never be registered.
import './CompactListingMolecule.lit'
import type { CompactListingMolecule } from './CompactListingMolecule.lit'

const meta: Meta<CompactListingMolecule> = {
	title: 'Listings / Compact / Compact Listing Molecule',
	component: 'app-compact-listing-molecule',
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	args: {
		title: exampleIngredient.ingredient,
		imageSrc: exampleIngredient.imageUrl.small,
		description: exampleIngredient.amount,
	},
	render: (args) =>
		html`<app-compact-listing-molecule
			.imageSrc=${args.imageSrc}
			.title=${args.title}
			.description=${args.description}
			.href=${args.href}
			.hrefParams=${args.hrefParams}
		></app-compact-listing-molecule>`,
}

export default meta

type Story = StoryObj<CompactListingMolecule>

export const Primary: Story = {}

export const LinksToAPage: Story = {
	name: 'Links to a page',
	args: { href: '/' },
}
