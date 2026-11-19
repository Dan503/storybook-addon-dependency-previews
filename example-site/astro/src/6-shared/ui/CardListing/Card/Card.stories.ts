import { exampleMeal } from 'example-site-shared/data'
import type { Meta, StoryObj } from '../../../storybook-only/storybook.types'
import Card from './Card.astro'

export default {
	component: Card,
} satisfies Meta<typeof Card>

type Story = StoryObj<typeof Card>

export const Default: Story = {
	args: {
		title: exampleMeal.name,
		description:
			'A long description, to show that the card cuts it off after four lines rather than letting the card grow taller than the others beside it. It keeps going for a while longer so that the cut is easy to see, whatever width the card is drawn at, because a short description would never reach the fourth line.',
		imgSrc: exampleMeal.image,
		href: '/meal/[mealId]',
		hrefParams: { mealId: exampleMeal.id },
		headingLevel: 2,
	},
}
