import type { Meal } from 'example-site-shared/utils'
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
				<h1 class="text-3xl font-bold mb-5">{meal.name}</h1>
				<div class="grid gap-4 lg:grid-cols-[2fr_30rem]">
					<div class="grid gap-4 sm:grid-cols-[1fr_2fr]">
						<img src={meal.image} alt={meal.name} class="mt-2" />
						<div>
							<h2 class="text-2xl font-bold">Recipe</h2>
							<p class="whitespace-pre-wrap">
								{meal.instructions}
							</p>
						</div>
					</div>
					<div class="grid gap-4 grid-rows-[auto_1fr] items-start">
						<h2 class="text-2xl font-bold">Ingredients</h2>
						<CompactListingOrganism
							items={meal.ingredients.map((x) => ({
								title: x.ingredient,
								description: x.amount,
								imageSrc: x.imageUrl.small,
							}))}
						/>
					</div>
				</div>
			</ScreenPaddingAtom>
		</SiteFrameOrganism>
	)
}
