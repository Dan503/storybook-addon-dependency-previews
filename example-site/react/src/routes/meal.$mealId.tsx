import { createFileRoute } from '@tanstack/react-router'
import { fetchMealById } from 'example-site-shared/utils'
import { DetailPageTemplate } from '../components/04-templates/DetailPageTemplate'

export const Route = createFileRoute('/meal/$mealId')({
	component: RouteComponent,
	loader: ({ params }) => fetchMealById(params.mealId),
	head: ({ loaderData }) => ({
		meta: [
			{
				title: `${loaderData?.name} | The Meal Place`,
			},
			{
				name: 'description',
				content: `Discover how to cook ${loaderData?.name}.`,
			},
		],
	}),
})

function RouteComponent() {
	const meal = Route.useLoaderData()
	return <DetailPageTemplate meal={meal} />
}
