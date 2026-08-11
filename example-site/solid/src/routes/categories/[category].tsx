import { Title } from '@solidjs/meta'
import {
	createAsync,
	query,
	useParams,
	type RouteDefinition,
} from '@solidjs/router'
import { fetchMealsByCategory } from 'example-site-shared/utils'
import { CardListTemplate } from '../../components/04-templates/CardListTemplate'
import { routePaths } from '../../routePaths'

const getMealsByCategory = query(fetchMealsByCategory, 'mealsByCategory')

export const route = {
	// `params` is typed as possibly missing because it is shared by every
	// route, so there is nothing to fetch ahead of time without a category.
	preload: ({ params }) => {
		if (!params.category) return
		return getMealsByCategory(decodeURIComponent(params.category))
	},
} satisfies RouteDefinition

export default function CategoryMeals() {
	const params = useParams<{ category: string }>()
	const categoryName = () => decodeURIComponent(params.category)
	const meals = createAsync(() => getMealsByCategory(categoryName()))

	return (
		<>
			<Title>{categoryName()} Meals | The Meal Place</Title>
			<CardListTemplate
				title={`${categoryName()} meals`}
				introText={`Explore the delicious ${categoryName()} meals!`}
				cardList={meals()?.map((meal) => ({
					title: meal.name,
					description: meal.area,
					imgSrc: meal.image,
					href: routePaths.getMeal(meal.id),
				}))}
			/>
		</>
	)
}
