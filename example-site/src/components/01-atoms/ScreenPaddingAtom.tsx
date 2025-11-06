import type { ReactNode } from 'react'

export interface PropsForScreenPaddingAtom {
	children?: ReactNode
	padVertical?: boolean
}

export function ScreenPaddingAtom({
	children,
	padVertical,
}: PropsForScreenPaddingAtom) {
	return (
		<div className={`ScreenPaddingAtom ${padVertical ? 'p-6' : 'px-6'}`}>
			{children}
		</div>
	)
}
