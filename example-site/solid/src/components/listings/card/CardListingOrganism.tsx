import { CardMolecule, type PropsForCardMolecule } from './CardMolecule'
import s from './CardListingOrganism.module.css'

export interface PropsForCardListingOrganism {
	cards: Array<PropsForCardMolecule> | undefined
}

export function CardListingOrganism({ cards }: PropsForCardListingOrganism) {
	return (
		<div class="@container grid">
			<div
				class={`${s.CardListingOrganism} grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6`}
			>
				{cards?.map((card) => (
					<CardMolecule {...card} />
				))}
			</div>
		</div>
	)
}
