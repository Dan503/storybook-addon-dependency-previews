import { fetchCategories } from 'example-site-shared/utils'
import { CardListTemplate } from '../components/04-templates/CardListTemplate'
import { setPageTitle } from '../lib/pageTitle'
import { useFetchedData } from '../lib/useFetchedData'

export function CategoriesPage() {
	setPageTitle('Meal Categories | The Meal Place')
	const categories = useFetchedData('categories', fetchCategories)
	const categoryList = categories.status === 'ready' ? categories.data : []

	return (
		<CardListTemplate
			title="Food Categories"
			introText="Explore what delicious types of food await you!"
			isLoading={categories.status === 'waiting'}
			cardList={categoryList.map((category) => ({
				title: category.strCategory,
				description: category.strCategoryDescription,
				imgSrc: category.strCategoryThumb,
				href: '/categories/:category',
				hrefParams: { category: category.strCategory },
			}))}
		/>
	)
}
