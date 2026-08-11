import { CardListingOrganism } from '../listings/card/CardListingOrganism'
import { SiteFrameOrganism } from '../03-organisms/SiteFrameOrganism'
import { ScreenPaddingAtom } from '../01-atoms/ScreenPaddingAtom'
import type { PropsForCardMolecule } from '../listings/card/CardMolecule'

export interface PropsForCardListTemplate {
	title: string
	introText?: string
	cardList?: Array<PropsForCardMolecule>
}

// Everything is read as `props.something` rather than pulled out into its own
// variable, so that a page whose cards arrive after the first draw still shows
// them.
export function CardListTemplate(props: PropsForCardListTemplate) {
	return (
		<SiteFrameOrganism>
			<ScreenPaddingAtom padVertical>
				<div class="MealListTemplate grid gap-4">
					<h1 class="text-4xl font-bold">{props.title}</h1>
					<p class="mb-2">{props.introText}</p>
					<CardListingOrganism cards={props.cardList} />
				</div>
			</ScreenPaddingAtom>
		</SiteFrameOrganism>
	)
}
