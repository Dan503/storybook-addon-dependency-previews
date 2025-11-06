import type { ReactNode } from 'react'
import { ScreenPaddingAtom } from './ScreenPaddingAtom'

export interface PropsForContentRestraintAtom {
	children?: ReactNode
}

/** Prevent content from stretching out to the far edges of the screen. */
export function ContentRestraintAtom({
	children,
}: PropsForContentRestraintAtom) {
	return (
		<ScreenPaddingAtom>
			<div className="ContentRestraintAtom grid grid-cols-[1fr_minmax(auto,800px)_1fr]">
				<div className="col-start-2 width-full h-full">{children}</div>
			</div>
		</ScreenPaddingAtom>
	)
}
