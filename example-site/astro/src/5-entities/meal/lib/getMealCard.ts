import type { Meal } from 'example-site-shared/utils'
import type { PropsForCard } from '../../../6-shared/ui/CardListing/Card/Card.types'

/** Turns a meal into the card that links to its page. */
export function getMealCard(meal: Meal): PropsForCard {
	return {
		title: meal.name,
		description: meal.area,
		imgSrc: meal.image,
		href: '/meal/[mealId]',
		hrefParams: { mealId: meal.id },
	}
}
