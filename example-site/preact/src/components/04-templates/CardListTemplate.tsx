import { CardListingOrganism } from '../listings/card/CardListingOrganism'
import { SiteFrameOrganism } from '../03-organisms/SiteFrameOrganism'
import { ScreenPaddingAtom } from '../01-atoms/ScreenPaddingAtom'
import type { PropsForCardMolecule } from '../listings/card/CardMolecule'

export interface PropsForCardListTemplate {
	title: string
	introText?: string
	cardList?: Array<PropsForCardMolecule>
}

export function CardListTemplate({
	title,
	introText,
	cardList,
}: PropsForCardListTemplate) {
	return (
		<SiteFrameOrganism>
			<ScreenPaddingAtom padVertical>
				<div class="MealListTemplate grid gap-4">
					<h1 class="text-4xl font-bold">{title}</h1>
					<p class="mb-2">{introText}</p>
					<CardListingOrganism cards={cardList} />
				</div>
			</ScreenPaddingAtom>
		</SiteFrameOrganism>
	)
}
