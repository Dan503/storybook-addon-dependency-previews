import { H, Section } from 'react-headings'
import type { Meal } from '../../utils/mealDbApiUtils'
import { CardListingOrganism } from '../listings/card/CardListingOrganism'
import { SiteFrameOrganism } from '../03-organisms/SiteFrameOrganism'

export interface PropsForCardListTemplate {
	categoryName?: string
	mealList?: Array<Meal>
}

export function CardListTemplate({
	categoryName,
	mealList,
}: PropsForCardListTemplate) {
	return (
		<SiteFrameOrganism>
			<div className="MealListTemplate grid gap-6">
				<Section
					component={
						<H className="text-4xl font-bold">
							Delicious {categoryName} dishes
						</H>
					}
				>
					<CardListingOrganism
						cards={mealList?.map((meal) => ({
							id: meal.id,
							title: meal.name,
							imgSrc: meal.image,
							description: meal.area,
							href: `/meal/${meal.id}`,
						}))}
					/>
				</Section>
			</div>
		</SiteFrameOrganism>
	)
}
