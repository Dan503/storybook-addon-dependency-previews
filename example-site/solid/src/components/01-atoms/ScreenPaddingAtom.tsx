import type { JSX } from 'solid-js'

export interface PropsForScreenPaddingAtom {
	children?: JSX.Element
	padVertical?: boolean
}

export function ScreenPaddingAtom(props: PropsForScreenPaddingAtom) {
	return (
		<div
			class={`ScreenPaddingAtom ${props.padVertical ? 'p-6' : 'px-6'} w-full`}
		>
			{props.children}
		</div>
	)
}
