import { createFileRoute } from '@tanstack/react-router'
import { fetchCategories } from 'example-site-shared/utils'
import { CardListTemplate } from '../components/04-templates/CardListTemplate'

export const Route = createFileRoute('/categories/')({
	component: RouteComponent,
	loader: fetchCategories,
	head: () => ({
		meta: [
			{
				title: 'Meal Categories | The Meal Place',
			},
			{
				name: 'description',
				content:
					'Explore a variety of meal categories on The Meal Place. Find recipes, cooking tips, and more!',
			},
		],
	}),
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
				hrefParams: { category: c.strCategory },
			}))}
			title="Food Categories"
			introText="Explore what delicious types of food await you!"
		/>
	)
}
