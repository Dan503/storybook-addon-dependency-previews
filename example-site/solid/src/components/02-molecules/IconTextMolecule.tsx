import { Dynamic } from 'solid-js/web'
import type { JSX } from 'solid-js'
import type { IconComponent } from '../01-atoms/icons/iconTypes'

export interface PropsForIconTextMolecule {
	Icon: IconComponent
	children?: JSX.Element
}

export function IconTextMolecule(props: PropsForIconTextMolecule) {
	return (
		<p class="text-lg font-medium text-gray-900 flex items-center gap-1">
			{/* Dynamic, so that swapping the icon swaps what is drawn — naming the
			    component straight from props would settle it on the first draw. */}
			<Dynamic component={props.Icon} className="h-[1em] w-[1em]" />
			{props.children}
		</p>
	)
}
