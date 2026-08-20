import { splitProps } from 'solid-js'
import type {
	DollarRouteAddress,
	LinkAddress,
	Meal,
} from 'example-site-shared/utils'
import { InternalLinkAtom } from '../../01-atoms/InternalLinkAtom'

export interface PropsForCardMolecule extends LinkAddress<DollarRouteAddress> {
	title: string
	imgSrc: string
	description: string
}

/**
 * Builds the card for one meal.
 *
 * Both lists that show meals — the featured ones on the home page and the ones
 * in a category — draw the same card from the same fields, so they share this
 * rather than each writing it out.
 *
 * @param meal - the meal the card stands for
 */
export function getMealCard(meal: Meal): PropsForCardMolecule {
	return {
		title: meal.name,
		description: meal.area,
		imgSrc: meal.image,
		href: '/meal/$mealId',
		hrefParams: { mealId: meal.id },
	}
}

export function CardMolecule(props: PropsForCardMolecule) {
	const [linkAddress, card] = splitProps(props, ['href', 'hrefParams'])
	return (
		<div class="@container grid">
			<InternalLinkAtom
				{...linkAddress}
				class="h-full flex @max-sm:flex-col gap-2 border rounded-2xl overflow-hidden bg-white focus:bg-teal-200 hover:bg-teal-200 hover:shadow-lg hover:transform-[scale(1.02)] transition-all"
			>
				<img
					src={card.imgSrc}
					alt=""
					class="aspect-video @sm:aspect-square @sm:w-40 object-cover"
				/>
				<div class="p-4 w-full">
					<h3 class="text-xl font-bold">{card.title}</h3>
					<p class="line-clamp-4">{card.description}</p>
				</div>
			</InternalLinkAtom>
		</div>
	)
}
