import type { JSX } from 'solid-js'
import { ScreenPaddingAtom } from './ScreenPaddingAtom'

export interface PropsForContentRestraintAtom {
	children?: JSX.Element
	padVertical?: boolean
}

/** Prevent content from stretching out to the far edges of the screen. */
export function ContentRestraintAtom(props: PropsForContentRestraintAtom) {
	return (
		<ScreenPaddingAtom padVertical={props.padVertical}>
			<div class="ContentRestraintAtom grid grid-cols-[1fr_minmax(auto,800px)_1fr]">
				<div class="col-start-2 width-full h-full">{props.children}</div>
			</div>
		</ScreenPaddingAtom>
	)
}
