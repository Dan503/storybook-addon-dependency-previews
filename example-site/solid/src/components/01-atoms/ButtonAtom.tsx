import { mergeProps } from 'solid-js'
import type { JSX } from 'solid-js'

export interface PropsForButtonAtom {
	type?: 'button' | 'submit' | 'reset'
	onClick?: (event: ClickEvent) => void
	children: JSX.Element
}

type ClickEvent = MouseEvent & {
	currentTarget: HTMLButtonElement
	target: Element
}

export function ButtonAtom(props: PropsForButtonAtom) {
	const mergedProps = mergeProps({ type: 'button' as const }, props)
	return (
		<button
			type={mergedProps.type}
			onClick={mergedProps.onClick}
			class="bg-teal-200 hover:bg-teal-100 focus:bg-teal-100 border-2 border-teal-900 px-4 py-1 rounded-lg"
		>
			{mergedProps.children}
		</button>
	)
}
