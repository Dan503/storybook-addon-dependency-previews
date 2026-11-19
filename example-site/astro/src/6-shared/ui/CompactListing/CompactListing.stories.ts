import { ingredientItems } from 'example-site-shared/data'
import type { Meta, StoryObj } from '../../storybook-only/storybook.types'
import type { PropsForCompactListingItem } from './CompactListingItem/CompactListingItem.types'
import CompactListing from './CompactListing.astro'

export default {
	component: CompactListing,
} satisfies Meta<typeof CompactListing>

type Story = StoryObj<typeof CompactListing>

export const Default: Story = {
	args: {
		items: ingredientItems satisfies Array<PropsForCompactListingItem>,
		headingLevel: 3,
	},
}
