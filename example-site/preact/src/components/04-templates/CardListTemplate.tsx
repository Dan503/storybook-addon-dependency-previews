import { CardListingOrganism } from '../listings/card/CardListingOrganism'
import { SiteFrameOrganism } from '../03-organisms/SiteFrameOrganism'
import { ScreenPaddingAtom } from '../01-atoms/ScreenPaddingAtom'
import type { PropsForCardMolecule } from '../listings/card/CardMolecule'

export interface PropsForCardListTemplate {
	title: string
	introText?: string
	cardList?: Array<PropsForCardMolecule>
	/** Shows "Loading..." where the cards go, while they are on their way. */
	isLoading?: boolean
}

export function CardListTemplate({
	title,
	introText,
	cardList,
	isLoading,
}: PropsForCardListTemplate) {
	return (
		<SiteFrameOrganism>
			<ScreenPaddingAtom padVertical>
				<div class="MealListTemplate grid gap-4">
					<h1 class="text-4xl font-bold">{title}</h1>
					<p class="mb-2">{introText}</p>
					{isLoading ? (
						<p>Loading...</p>
					) : (
						<CardListingOrganism cards={cardList} />
					)}
				</div>
			</ScreenPaddingAtom>
		</SiteFrameOrganism>
	)
}
