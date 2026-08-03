import type { JSX } from 'solid-js'
import { ScreenPaddingAtom } from './ScreenPaddingAtom'

export interface PropsForContentRestraintAtom {
	children?: JSX.Element
	padVertical?: boolean
}

/** Prevent content from stretching out to the far edges of the screen. */
export function ContentRestraintAtom({
	children,
	padVertical,
}: PropsForContentRestraintAtom) {
	return (
		<ScreenPaddingAtom padVertical={padVertical}>
			<div class="ContentRestraintAtom grid grid-cols-[1fr_minmax(auto,800px)_1fr]">
				<div class="col-start-2 width-full h-full">{children}</div>
			</div>
		</ScreenPaddingAtom>
	)
}
