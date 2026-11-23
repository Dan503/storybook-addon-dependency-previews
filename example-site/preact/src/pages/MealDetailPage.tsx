import { useRoute } from 'preact-iso'
import { fetchMealById } from 'example-site-shared/utils'
import { DetailPageTemplate } from '../components/04-templates/DetailPageTemplate'
import { setPageTitle, setStandInPageTitle } from '../lib/pageTitle'
import { useFetchedData } from '../lib/useFetchedData'
import { NotFoundPage } from './NotFoundPage'

export function MealDetailPage() {
	const { params } = useRoute()
	const mealId = params.mealId ?? ''

	const meal = useFetchedData(`meal:${mealId}`, () => fetchMealById(mealId))

	if (meal.status === 'waiting') {
		// The meal's name is not known until it arrives.
		setStandInPageTitle('Meal | The Meal Place')
		return <DetailPageTemplate meal={undefined} isLoading />
	}

	if (!meal.data) return <NotFoundPage />

	setPageTitle(`${meal.data.name} | The Meal Place`)
	return <DetailPageTemplate meal={meal.data} />
}
