import type { IconProps, SvgAttributes } from './iconTypes'

// Takes the icon props and nothing wider, because those are the only ones the
// markup below passes on. Accepting every SVG attribute would let a caller set
// one and see nothing happen.
export function Svg(props: IconProps) {
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
	// @ts-expect-error Solid's SVG attribute types have no `focusable`. Written
	// as expect-error rather than ignore so this fails once they gain it.
	focusable: false,
}
