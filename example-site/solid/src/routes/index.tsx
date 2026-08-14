import { Title } from '@solidjs/meta'
import { HomeTemplate } from '../components/04-templates/HomeTemplate'
import { featuredMealsData } from 'example-site-shared/data'

export default function Home() {
	return (
		<>
			<Title>
				The Meal Place - The Storybook Dependency Previews Example Site
			</Title>
			<HomeTemplate featuredMeals={featuredMealsData} />
		</>
	)
}
