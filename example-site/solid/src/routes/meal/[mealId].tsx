import { Title } from '@solidjs/meta'
import {
	createAsync,
	query,
	useParams,
	type RouteDefinition,
} from '@solidjs/router'
import { fetchMealById } from 'example-site-shared/utils'
import { DetailPageTemplate } from '../../components/04-templates/DetailPageTemplate'

const getMealById = query(fetchMealById, 'meal')

export const route = {
	// `params` is typed as possibly missing because it is shared by every
	// route, so there is nothing to fetch ahead of time without a meal id.
	preload: ({ params }) => {
		if (!params.mealId) return
		return getMealById(params.mealId)
	},
} satisfies RouteDefinition

export default function MealDetail() {
	const params = useParams<{ mealId: string }>()
	// `deferStream` holds the page back on the server until the meal has
	// arrived, so the browser tab title is the meal's name on the first view
	// rather than being filled in afterwards.
	const meal = createAsync(() => getMealById(params.mealId), {
		deferStream: true,
	})

	return (
		<>
			<Title>{meal()?.name ?? 'Meal'} | The Meal Place</Title>
			<DetailPageTemplate meal={meal()} />
		</>
	)
}
