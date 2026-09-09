import { useRoute } from 'preact-iso'
import { fetchMealsByCategory } from 'example-site-shared/utils'
import { CardListTemplate } from '../components/04-templates/CardListTemplate'
import { getMealCard } from '../components/listings/card/CardMolecule'
import { setPageTitle } from '../lib/pageTitle'
import { useDataOrWait } from '../lib/useDataOrWait'

export function CategoryMealsPage() {
	// preact-iso hands the piece over exactly as it was written into the
	// address, so a name carrying a space or an ampersand has to be read back
	// out here — the link that built the address escaped it going in.
	const { params } = useRoute()
	const categoryName = decodeURIComponent(params.category ?? '')

	setPageTitle(`${categoryName} Meals | The Meal Place`)
	const meals = useDataOrWait(`meals-in-category:${categoryName}`, () =>
		fetchMealsByCategory(categoryName),
	)

	return (
		<CardListTemplate
			title={`${categoryName} meals`}
			introText={`Explore the delicious ${categoryName} meals!`}
			cardList={meals.map(getMealCard)}
		/>
	)
}
