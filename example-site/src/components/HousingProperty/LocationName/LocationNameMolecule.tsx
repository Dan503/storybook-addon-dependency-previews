import { MapPinIcon } from '../../icons/MapPinIcon'

export interface PropsForLocationNameMolecule {
	children?: React.ReactNode
}

export function LocationNameMolecule({
	children,
}: PropsForLocationNameMolecule) {
	return (
		<span className="text-lg font-medium text-gray-900 flex items-center gap-1">
			<MapPinIcon className="h-[1em] w-[1em]" />
			{children}
		</span>
	)
}
