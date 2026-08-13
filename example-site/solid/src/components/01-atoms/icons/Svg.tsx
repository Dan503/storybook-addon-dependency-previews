import type { PropsWithChildren } from 'solid-js'
import type { SvgAttributes } from './iconTypes'

export interface SvgProps extends PropsWithChildren<SvgAttributes> {
	altText?: string
	className?: string
}

export function Svg(props: SvgProps) {
	return (
		<svg
			{...staticAttrs}
			role="img"
			// Set here rather than through a helper, so that a change to the alt
			// text is drawn. Solid only re-draws what is read inside the markup.
			aria-label={props.altText ? props.altText : ''}
			aria-hidden={props.altText ? undefined : true}
			class={props.className}
		>
			{props.children}
		</svg>
	)
}

const staticAttrs: SvgAttributes = {
	xmlns: 'http://www.w3.org/2000/svg',
	fill: 'none',
	viewBox: '0 0 24 24',
	'stroke-width': 1.5,
	stroke: 'currentColor',
	height: 24,
	width: 24,
	// @ts-ignore
	focusable: false,
}
