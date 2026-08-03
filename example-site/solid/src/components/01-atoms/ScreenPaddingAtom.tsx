import type { JSX } from 'solid-js'

export interface PropsForScreenPaddingAtom {
	children?: JSX.Element
	padVertical?: boolean
}

export function ScreenPaddingAtom({
	children,
	padVertical,
}: PropsForScreenPaddingAtom) {
	return (
		<div class={`ScreenPaddingAtom ${padVertical ? 'p-6' : 'px-6'} w-full`}>
			{children}
		</div>
	)
}
