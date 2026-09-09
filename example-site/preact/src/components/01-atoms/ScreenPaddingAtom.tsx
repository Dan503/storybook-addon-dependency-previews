import type { ComponentChildren } from 'preact'

export interface PropsForScreenPaddingAtom {
	children?: ComponentChildren
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
