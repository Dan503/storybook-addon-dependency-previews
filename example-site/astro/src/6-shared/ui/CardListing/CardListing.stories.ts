import { mealCards } from 'example-site-shared/data'
import type { Meta, StoryObj } from '../../storybook-only/storybook.types'
import type { PropsForCard } from './Card/Card.types'
import CardListing from './CardListing.astro'

export default {
	component: CardListing,
} satisfies Meta<typeof CardListing>

type Story = StoryObj<typeof CardListing>

// The shared example cards are written with React's `$` address, so swap in this site's own
const astroMealCards = mealCards.map((card) => ({
	...card,
	href: '/meal/[mealId]',
})) satisfies Array<PropsForCard>

export const Default: Story = {
	args: {
		cards: astroMealCards,
		headingLevel: 2,
	},
}
