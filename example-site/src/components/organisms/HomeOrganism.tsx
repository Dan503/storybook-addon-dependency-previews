import { HeroBlockOrganism } from './HeroBlockOrganism'
import { CardListingOrganism } from '../listings/card/CardListingOrganism'
import { H, Section } from 'react-headings'
import type { Meal } from '../../utils/mealDbApiUtils'

export interface PropsForHomeOrganism {
	mealList: Array<Meal>
}

export function HomeOrganism({ mealList }: PropsForHomeOrganism) {
	return (
		<div className="HomeOrganism grid gap-4">
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
