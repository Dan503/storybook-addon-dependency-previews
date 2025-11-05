import { CardMolecule, type PropsForCardMolecule } from './CardMolecule'

export interface PropsForCardListingOrganism {
	cards: Array<PropsForCardMolecule> | undefined
}

export function CardListingOrganism({ cards }: PropsForCardListingOrganism) {
	return (
		<div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
			{cards?.map((card) => (
				<CardMolecule {...card} key={card.title} />
			))}
		</div>
	)
}
