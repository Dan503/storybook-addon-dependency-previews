/**
 * What one compact listing row shows.
 *
 * Kept in a `.ts` file rather than in `CompactListingItem.astro` so stories can be type checked
 * against it: the type checker can't read types out of `.astro` files.
 */
export interface PropsForCompactListingItem {
	/** Address of the row's image. */
	imageSrc: string
	/** The row's heading. */
	title: string
	/** Shown under the heading. */
	description: string
}
