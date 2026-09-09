import { useEffect, useState } from 'preact/hooks'
import {
	fetchRandomMealList,
	type Meal,
} from 'example-site-shared/utils'
import { HomeTemplate } from '../components/04-templates/HomeTemplate'
import { setPageTitle } from '../lib/pageTitle'

const featuredMealCount = 7

/**
 * The front page.
 *
 * Its meals are a random seven, so they are fetched here in the browser on each
 * visit rather than through `getDataOrWait`. Going through that would have the
 * build ask for them once and write the answer into the file every visitor is
 * served, which would hand everyone the same seven forever. The Angular site's
 * home page does the same thing for the same reason; the three sites that fetch
 * theirs per visit have a server to do it on, and a set of built files does not.
 *
 * `HomeTemplate` draws its frame, welcome text and heading from an empty list,
 * so the written-out file is the page minus its hero picture and cards.
 */
export function HomePage() {
	setPageTitle(
		'The Meal Place - The Storybook Dependency Previews Example Site',
	)
	const [featuredMeals, setFeaturedMeals] = useState<Array<Meal>>([])

	useEffect(() => {
		fetchRandomMealList(featuredMealCount).then(setFeaturedMeals)
	}, [])

	return <HomeTemplate featuredMeals={featuredMeals} />
}
