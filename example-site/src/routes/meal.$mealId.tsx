import { createFileRoute } from '@tanstack/react-router'
import { fetchMealById } from '../utils/mealDbApiUtils'
import { DetailPageTemplate } from '../components/04-templates/DetailPageTemplate'

export const Route = createFileRoute('/meal/$mealId')({
	component: RouteComponent,
	loader: ({ params }) => fetchMealById(params.mealId),
})

function RouteComponent() {
	const meal = Route.useLoaderData()
	return <DetailPageTemplate meal={meal} />
}
