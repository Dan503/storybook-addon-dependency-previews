import type { ReactNode } from 'react'
import type { IconComponent } from '../01-atoms/icons/iconTypes'

export interface PropsForIconTextMolecule {
	Icon: IconComponent
	children?: ReactNode
}

export function IconTextMolecule({ Icon, children }: PropsForIconTextMolecule) {
	return (
		<p className="text-lg font-medium text-gray-900 flex items-center gap-1">
			<Icon className="h-[1em] w-[1em]" />
			{children}
		</p>
	)
}
