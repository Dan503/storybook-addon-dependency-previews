import { For } from 'solid-js'
import { CardMolecule, type PropsForCardMolecule } from './CardMolecule'
import s from './CardListingOrganism.module.css'

export interface PropsForCardListingOrganism {
	cards: Array<PropsForCardMolecule> | undefined
}

// The cards are read as `props.cards` inside `For` rather than mapped over
// once, so that cards arriving after the first draw still appear — which is
// what happens when a page loads its meals as you move to it.
export function CardListingOrganism(props: PropsForCardListingOrganism) {
	return (
		<div class="@container grid">
			<div
				class={`${s.CardListingOrganism} grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6`}
			>
				<For each={props.cards ?? []}>
					{(card) => <CardMolecule {...card} />}
				</For>
			</div>
		</div>
	)
}
