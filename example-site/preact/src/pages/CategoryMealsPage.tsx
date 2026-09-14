import { useRoute } from 'preact-iso'
import { fetchMealsByCategory } from 'example-site-shared/utils'
import { CardListTemplate } from '../components/04-templates/CardListTemplate'
import { getMealCard } from '../components/listings/card/CardMolecule'
import { setPageTitle } from '../lib/pageTitle'
import { useDataOrWait } from '../lib/useDataOrWait'

export function CategoryMealsPage() {
	// Read back plainly: the link that built the address escaped the name going
	// in, and preact-iso unescapes it again on the way out, so it arrives here
	// as it was written. Unescaping it a second time would throw on a name
	// carrying a literal percent sign.
	const { params } = useRoute()
	const categoryName = params.category ?? ''

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
