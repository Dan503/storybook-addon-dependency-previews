import { useRoute } from 'preact-iso'
import { fetchMealById } from 'example-site-shared/utils'
import { DetailPageTemplate } from '../components/04-templates/DetailPageTemplate'
import { setPageTitle } from '../lib/pageTitle'
import { useDataOrWait } from '../lib/useDataOrWait'
import { NotFoundPage } from './NotFoundPage'

export function MealDetailPage() {
	const { params } = useRoute()
	const mealId = params.mealId ?? ''

	const meal = useDataOrWait(`meal:${mealId}`, () => fetchMealById(mealId))

	// By the time this line runs the request has finished, because
	// `useDataOrWait` holds the page back until it has — so nothing here means
	// no such meal, rather than one that has not arrived yet.
	if (!meal) return <NotFoundPage />

	setPageTitle(`${meal.name} | The Meal Place`)
	return <DetailPageTemplate meal={meal} />
}
