import { css } from 'lit'

/**
 * Makes an element a grid, so whatever it draws stretches to fill it.
 *
 * The site element and every page include this, which carries the full-height
 * layout from `#app` down to the template unbroken, so the footer stays at the
 * bottom of a short page. Each element includes it in its own styles, since
 * styles do not reach into another element's shadow root.
 */
export const gridHostStyles = css`
	:host {
		display: grid;
	}
`
