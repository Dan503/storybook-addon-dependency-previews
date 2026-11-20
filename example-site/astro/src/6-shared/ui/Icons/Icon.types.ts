/**
 * The props every icon takes, passed on to the `<svg>` that `Svg.astro` draws.
 *
 * Kept in a `.ts` file rather than in `Svg.astro` so the icons can share one set of prop
 * descriptions: the type checker can't read types out of `.astro` files.
 */
export interface PropsForIcon {
	/**
	 * Read out by screen readers. Leave it out only when the icon adds nothing the text beside it doesn't
	 * already say. A phone icon in front of a bare number does add something: it says the number is a phone number.
	 */
	altText?: string
	/** Extra classes for the icon's `<svg>`. */
	class?: string
}
