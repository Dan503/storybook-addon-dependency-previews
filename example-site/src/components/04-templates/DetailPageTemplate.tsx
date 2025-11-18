import { H, Section } from 'react-headings'
import type { Meal } from '../../utils/mealDbApiUtils'
import { CompactListingOrganism } from '../listings/compact/CompactListingOrganism'
import { SiteFrameOrganism } from '../03-organisms/SiteFrameOrganism'
import { ScreenPaddingAtom } from '../01-atoms/ScreenPaddingAtom'

export interface PropsForDetailPageTemplate {
	meal: Meal | undefined | null
	isLoading?: boolean
}

export function DetailPageTemplate({
	meal,
	isLoading,
}: PropsForDetailPageTemplate) {
	if (isLoading || !meal) {
		return <div>Loading...</div>
	}

	return (
		<SiteFrameOrganism>
			<ScreenPaddingAtom padVertical>
				<Section component={<H className="text-3xl font-bold">{meal.name}</H>}>
					<div className="grid gap-4 lg:grid-cols-[2fr_30rem]">
						<div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
							<img src={meal.image} alt={meal.name} className="mt-2" />
							<div>
								<Section
									component={<H className="text-2xl font-bold">Recipe</H>}
								>
									<p className="whitespace-pre-wrap">{meal.instructions}</p>
								</Section>
							</div>
						</div>
						<div className="grid gap-4 grid-rows-[auto_1fr]">
							<Section
								component={<H className="text-2xl font-bold">Ingredients</H>}
							>
								<CompactListingOrganism
									items={meal.ingredients.map((x) => ({
										title: x.ingredient,
										description: x.amount,
										imageSrc: x.imageUrl.small,
									}))}
								/>
							</Section>
						</div>
					</div>
				</Section>
			</ScreenPaddingAtom>
		</SiteFrameOrganism>
	)
}
