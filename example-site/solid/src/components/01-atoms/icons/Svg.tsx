import type { PropsWithChildren } from 'solid-js'
import type { SvgAttributes } from './iconTypes'

export interface SvgProps extends PropsWithChildren<SvgAttributes> {
	altText?: string
	className?: string
}

export function Svg({ altText, className, children }: SvgProps) {
	return (
		<svg {...defaultIconAttributes(altText)} class={className}>
			{children}
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

function defaultIconAttributes(altText?: string): SvgAttributes {
	const dynamicAttrs: SvgAttributes = {
		role: 'img',
		'aria-label': altText ? altText : '',
		'aria-hidden': altText ? undefined : true,
	}
	return {
		...staticAttrs,
		...dynamicAttrs,
	}
}
