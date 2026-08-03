import type { JSX } from 'solid-js'
import type { IconComponent } from '../01-atoms/icons/iconTypes'

export interface PropsForIconTextMolecule {
	Icon: IconComponent
	children?: JSX.Element
}

export function IconTextMolecule({ Icon, children }: PropsForIconTextMolecule) {
	return (
		<p class="text-lg font-medium text-gray-900 flex items-center gap-1">
			<Icon className="h-[1em] w-[1em]" />
			{children}
		</p>
	)
}
