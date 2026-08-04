import {
	CompactListingMolecule,
	type PropsForCompactListingMolecule,
} from './CompactListingMolecule'

export interface PropsForCompactListingOrganism {
	items: Array<PropsForCompactListingMolecule>
}

export function CompactListingOrganism({
	items,
}: PropsForCompactListingOrganism) {
	return (
		<ul class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
			{items.map((item) => (
				<li>
					<CompactListingMolecule {...item} />
				</li>
			))}
		</ul>
	)
}
