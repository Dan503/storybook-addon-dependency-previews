import { createFileRoute } from '@tanstack/react-router'
import { fetchMealsByCategory } from '../utils/mealDbApiUtils'
import { CardListTemplate } from '../components/04-templates/CardListTemplate'

export const Route = createFileRoute('/categories/$category')({
	component: RouteComponent,
	loader: ({ params }) => fetchMealsByCategory(params.category),
	head: ({ params }) => ({
		meta: [
			{
				title: `${params.category} Meals | The Meal Place`,
			},
			{
				name: 'description',
				content: `Discover a variety of delicious ${params.category} meals on The Meal Place. Find recipes, cooking tips, and more!`,
			},
		],
	}),
})

function RouteComponent() {
	const params = Route.useParams()
	const meals = Route.useLoaderData()
	return (
		<CardListTemplate
			title={`${params.category} meals`}
			introText={`Explore the delicious ${params.category} meals!`}
			cardList={meals.map((meal) => ({
				title: meal.name,
				imgSrc: meal.image,
				description: `${meal.area}`,
				href: '/meal/$mealId',
				hrefParams: { mealId: meal.id },
			}))}
		/>
	)
}
