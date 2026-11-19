import { exampleIngredient } from 'example-site-shared/data'
import type { Meta, StoryObj } from '../../../storybook-only/storybook.types'
import CompactListingItem from './CompactListingItem.astro'

export default {
	component: CompactListingItem,
} satisfies Meta<typeof CompactListingItem>

type Story = StoryObj<typeof CompactListingItem>

export const Default: Story = {
	args: {
		title: exampleIngredient.ingredient,
		imageSrc: exampleIngredient.imageUrl.small,
		description: exampleIngredient.amount,
		headingLevel: 3,
	},
}
