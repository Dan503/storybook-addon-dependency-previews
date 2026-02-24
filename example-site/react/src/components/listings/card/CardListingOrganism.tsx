import { CardMolecule, type PropsForCardMolecule } from './CardMolecule'
import s from './CardListingOrganism.module.css'

export interface PropsForCardListingOrganism {
	cards: Array<PropsForCardMolecule> | undefined
}

export function CardListingOrganism({ cards }: PropsForCardListingOrganism) {
	return (
		<div className="@container grid">
			<div
				className={`${s.CardListingOrganism} grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6`}
			>
				{cards?.map((card) => (
					<CardMolecule {...card} key={card.title} />
				))}
			</div>
		</div>
	)
}
