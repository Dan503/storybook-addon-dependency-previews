import type { ReactNode } from 'react'
import type { IconProps } from './iconTypes'

interface SvgProps extends IconProps, SVGAttributes<SVGElement> {
	children?: ReactNode
}

export function Svg({
	altText,
	className,
	children,
	...svgOverrides
}: SvgProps) {
	return (
		<svg
			{...defaultIconAttributes(altText)}
			{...svgOverrides}
			className={className}
		>
			{children}
		</svg>
	)
}

import type { SVGAttributes } from 'react'

const staticAttrs: SVGAttributes<SVGElement> = {
	xmlns: 'http://www.w3.org/2000/svg',
	fill: 'none',
	viewBox: '0 0 24 24',
	strokeWidth: 1.5,
	stroke: 'currentColor',
	height: 24,
	width: 24,
	focusable: false,
}

function defaultIconAttributes(altText?: string): SVGAttributes<SVGElement> {
	const dynamicAttrs: SVGAttributes<SVGElement> = {
		role: 'img',
		'aria-label': altText ? altText : undefined,
		'aria-hidden': altText ? undefined : true,
	}
	return {
		...staticAttrs,
		...dynamicAttrs,
	}
}
