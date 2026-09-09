import { fetchCategories } from 'example-site-shared/utils'
import { CardListTemplate } from '../components/04-templates/CardListTemplate'
import { getDataOrWait } from '../lib/getDataOrWait'
import { setPageTitle } from '../lib/pageTitle'

export function CategoriesPage() {
	setPageTitle('Meal Categories | The Meal Place')
	const categories = getDataOrWait('categories', fetchCategories)

	return (
		<CardListTemplate
			title="Food Categories"
			introText="Explore what delicious types of food await you!"
			cardList={categories.map((category) => ({
				title: category.strCategory,
				description: category.strCategoryDescription,
				imgSrc: category.strCategoryThumb,
				href: '/categories/:category',
				hrefParams: { category: category.strCategory },
			}))}
		/>
	)
}
