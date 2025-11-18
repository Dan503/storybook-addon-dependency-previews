import { createFileRoute } from '@tanstack/react-router'
import { HomeTemplate } from '../components/04-templates/HomeTemplate'
import { fetchRandomMealList } from '../utils/mealDbApiUtils'

export const Route = createFileRoute('/')({
	component: App,
	loader: () => fetchRandomMealList(7),
})

function App() {
	const featuredMeals = Route.useLoaderData()

	return <HomeTemplate featuredMeals={featuredMeals} />
}
