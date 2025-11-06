import { H, Section } from 'react-headings'
import type { Meal } from '../../utils/mealDbApiUtils'
import { CardListingOrganism } from '../listings/card/CardListingOrganism'
import { SiteFrameOrganism } from '../03-organisms/SiteFrameOrganism'
import { ScreenPaddingAtom } from '../01-atoms/ScreenPaddingAtom'

export interface PropsForCardListTemplate {
	title: string
	introText?: string
	mealList?: Array<Meal>
}

export function CardListTemplate({
	title,
	introText,
	mealList,
}: PropsForCardListTemplate) {
	return (
		<SiteFrameOrganism>
			<ScreenPaddingAtom padVertical>
				<div className="MealListTemplate grid gap-4">
					<Section component={<H className="text-4xl font-bold">{title}</H>}>
						<p className="mb-2">{introText}</p>
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
			</ScreenPaddingAtom>
		</SiteFrameOrganism>
	)
}
