import type { Meal } from '../../utils/mealDbApiUtils'
import { HeroBlockOrganism } from '../03-organisms/HeroBlockOrganism'
import { H, Section } from 'react-headings'
import { CardListingOrganism } from '../listings/card/CardListingOrganism'

export interface PropsForHomeTemplate {
	mealList: Array<Meal>
}

export function HomeTemplate({ mealList }: PropsForHomeTemplate) {
	return (
		<div className="HomeTemplate grid gap-4">
			<HeroBlockOrganism
				title="Welcome to the Storybook Dependency Previews example site"
				imgSrc={mealList[0].image}
			>
				<p>
					This is an example site to demonstrate the dependency preview addon in
					a realistic environment
				</p>
			</HeroBlockOrganism>
			<Section component={<></>}>
				<H className="text-2xl font-bold">
					Take a look at some of these tasty recipes:
				</H>
				<CardListingOrganism
					cards={mealList.map((meal) => ({
						title: meal.name,
						description: `${meal.area} ${meal.category}`,
						imgSrc: meal.image,
						href: '#',
					}))}
				/>
			</Section>
		</div>
	)
}
