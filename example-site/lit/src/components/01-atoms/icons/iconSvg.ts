import { css, html, type SVGTemplateResult } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'

/**
 * Draws the `<svg>` every icon shares, around one icon's drawing.
 *
 * A plain function rather than a component like the sibling sites' `Svg`,
 * because a component is an element of its own: the drawing passed into it
 * would sit inside that element rather than directly inside the `<svg>`, and
 * the browser would stop reading it as part of a drawing.
 *
 * An icon given alt text is announced by screen readers; one without is hidden
 * from them, since it is only decoration beside words that already say it.
 *
 * @param altText - what a screen reader should announce, if anything
 * @param drawing - the icon's own shapes, written with Lit's `svg` tag
 */
export function getIconSvg(
	altText: string | undefined,
	drawing: SVGTemplateResult,
) {
	const isDecoration = !altText
	return html`<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke-width="1.5"
		stroke="currentColor"
		height="24"
		width="24"
		focusable="false"
		role="img"
		aria-label=${ifDefined(altText || undefined)}
		aria-hidden=${ifDefined(isDecoration ? 'true' : undefined)}
	>
		${drawing}
	</svg>`
}

/**
 * Sizes an icon to the text it sits beside.
 *
 * Every icon on the site is drawn at the size of the surrounding text, and text
 * size is one of the things that crosses into a component, so the icon takes it
 * as its own size and nothing outside it has to set one.
 */
export const iconStyles = css`
	:host {
		display: inline-block;
		width: 1em;
		height: 1em;
	}

	svg {
		display: block;
		width: 100%;
		height: 100%;
	}
`
