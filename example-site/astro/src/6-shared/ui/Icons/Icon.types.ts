/**
 * The props every icon takes, passed on to the `<svg>` that `Svg.astro` draws.
 *
 * Kept in its own file, like `Card.types.ts`, so `Svg`, `MapPinIcon` and `PhoneIcon` share one
 * set of prop descriptions.
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
