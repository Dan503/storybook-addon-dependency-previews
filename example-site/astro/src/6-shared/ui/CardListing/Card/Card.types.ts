import type { LinkAddressPropsViaBrackets } from 'example-site-shared/utils'

/**
 * What one card shows and where it links to.
 *
 * Kept in a `.ts` file rather than in `Card.astro` so `.ts` files and stories can be type checked
 * against it: the type checker can't read types out of `.astro` files.
 */
export interface PropsForCard extends LinkAddressPropsViaBrackets {
	title: string
	imgSrc: string
	description: string
}
