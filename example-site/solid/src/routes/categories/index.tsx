import { Title } from '@solidjs/meta'
import { createAsync, query, type RouteDefinition } from '@solidjs/router'
import { fetchCategories } from 'example-site-shared/utils'
import { CardListTemplate } from '../../components/04-templates/CardListTemplate'
import { routePaths } from '../../routePaths'

const getCategories = query(fetchCategories, 'categories')

export const route = {
	preload: () => getCategories(),
} satisfies RouteDefinition

export default function Categories() {
	const categories = createAsync(() => getCategories())

	return (
		<>
			<Title>Meal Categories | The Meal Place</Title>
			<CardListTemplate
				title="Food Categories"
				introText="Explore what delicious types of food await you!"
				cardList={categories()?.map((category) => ({
					title: category.strCategory,
					description: category.strCategoryDescription,
					imgSrc: category.strCategoryThumb,
					href: routePaths.getCategory(category.strCategory),
				}))}
			/>
		</>
	)
}
