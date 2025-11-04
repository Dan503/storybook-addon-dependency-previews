import { H, Section } from 'react-headings'
import type { Meal } from '../../utils/mealDbApiUtils'
import { CompactListingOrganism } from '../listings/compact/CompactListingOrganism'

export interface PropsForMealDetailTemplate {
	meal: Meal | undefined
	isLoading?: boolean
}

export function MealDetailTemplate({
	meal,
	isLoading,
}: PropsForMealDetailTemplate) {
	if (isLoading || !meal) {
		return <div>Loading...</div>
	}

	return (
		<div className="grid gap-4">
			<Section component={<H className="text-3xl font-bold">{meal.name}</H>}>
				<div className="grid gap-4 md:grid-cols-[1fr_2fr]">
					<img src={meal.image} alt={meal.name} className="mt-2" />
					<div>
						<Section component={<H className="text-2xl font-bold">Recipe</H>}>
							<p className="whitespace-pre-wrap">{meal.instructions}</p>
						</Section>
					</div>
					<div className="grid gap-4 md:col-span-2">
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
		</div>
	)
}
