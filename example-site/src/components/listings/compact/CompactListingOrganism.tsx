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
		<ul className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
			{items.map((item) => (
				<li key={item.title}>
					<CompactListingMolecule {...item} />
				</li>
			))}
		</ul>
	)
}
