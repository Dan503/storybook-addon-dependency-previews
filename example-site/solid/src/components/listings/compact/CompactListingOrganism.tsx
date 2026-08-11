import { For } from 'solid-js'
import {
	CompactListingMolecule,
	type PropsForCompactListingMolecule,
} from './CompactListingMolecule'

export interface PropsForCompactListingOrganism {
	items: Array<PropsForCompactListingMolecule>
}

// The items are read as `props.items` inside `For` rather than mapped over
// once, so that items arriving after the first draw still appear.
export function CompactListingOrganism(props: PropsForCompactListingOrganism) {
	return (
		<ul class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
			<For each={props.items}>
				{(item) => (
					<li>
						<CompactListingMolecule {...item} />
					</li>
				)}
			</For>
		</ul>
	)
}
