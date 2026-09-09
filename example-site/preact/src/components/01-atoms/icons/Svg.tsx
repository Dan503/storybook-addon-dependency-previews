import type { ComponentChildren, JSX } from 'preact'
import type { IconProps } from './iconTypes'

interface SvgProps extends IconProps {
	children?: ComponentChildren
}

type SvgAttributes = JSX.SVGAttributes<SVGSVGElement>

const staticAttrs: SvgAttributes = {
	xmlns: 'http://www.w3.org/2000/svg',
	fill: 'none',
	viewBox: '0 0 24 24',
	strokeWidth: 1.5,
	stroke: 'currentColor',
	height: 24,
	width: 24,
	// Written as text rather than a boolean because that is what an SVG
	// attribute holds — Preact passes it through to the element as given.
	focusable: 'false',
}

export function Svg({ altText, className, children }: SvgProps) {
	return (
		<svg {...defaultIconAttributes(altText)} class={className}>
			{children}
		</svg>
	)
}

/**
 * The attributes every icon carries, with the ones that depend on the alt text
 * filled in.
 *
 * An icon given alt text is announced by a screen reader under that text; one
 * without is hidden from it, because an icon beside words it already repeats is
 * noise.
 *
 * @param altText - what a screen reader should say, or nothing to hide the icon
 */
function defaultIconAttributes(altText?: string): SvgAttributes {
	return {
		...staticAttrs,
		role: 'img',
		'aria-label': altText ? altText : undefined,
		'aria-hidden': altText ? undefined : true,
	}
}
