import { H, Section } from 'react-headings'
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
				<div className="MealListTemplate grid gap-4">
					<Section component={<H className="text-4xl font-bold">{title}</H>}>
						<p className="mb-2">{introText}</p>
						<CardListingOrganism cards={cardList} />
					</Section>
				</div>
			</ScreenPaddingAtom>
		</SiteFrameOrganism>
	)
}
