import { createFileRoute } from '@tanstack/react-router'
import { HomeTemplate } from '../components/04-templates/HomeTemplate'
import { fetchRandomMealList } from '../utils/mealDbApiUtils'

export const Route = createFileRoute('/')({
	component: App,
	loader: () => fetchRandomMealList(7),
	head: () => ({
		meta: [
			{
				title:
					'The Meal Place - The Storybook Dependency Previews Example Site',
			},
			{
				name: 'description',
				content:
					'This is an example site to demonstrate the dependency preview addon in a realistic environment.',
			},
		],
	}),
})

function App() {
	const featuredMeals = Route.useLoaderData()

	return <HomeTemplate featuredMeals={featuredMeals} />
}
