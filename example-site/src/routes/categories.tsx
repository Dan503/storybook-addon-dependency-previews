import { createFileRoute } from '@tanstack/react-router'
import { fetchCategories } from '../utils/mealDbApiUtils'
import { CardListTemplate } from '../components/04-templates/CardListTemplate'

export const Route = createFileRoute('/categories')({
	component: RouteComponent,
	loader: fetchCategories,
})

function RouteComponent() {
	const categories = Route.useLoaderData()
	return (
		<CardListTemplate
			cardList={categories.map((c) => ({
				title: c.strCategory,
				description: c.strCategoryDescription,
				imgSrc: c.strCategoryThumb,
				href: '/categories/$category',
			}))}
			title="Food Categories"
			introText="Explore what delicious types of food await you!"
		/>
	)
}
