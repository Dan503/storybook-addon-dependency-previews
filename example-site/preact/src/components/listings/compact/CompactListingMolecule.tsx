import type { LinkAddressPropsViaColons } from 'example-site-shared/utils'
import { InternalLinkAtom } from '../../01-atoms/InternalLinkAtom'

interface ContentForCompactListing {
	imageSrc: string
	title: string
	description: string
}

/**
 * The address is optional — without one the item draws as plain content rather
 * than a link. Addresses outside this site belong in `ExternalLinkAtom`.
 */
export type PropsForCompactListingMolecule = ContentForCompactListing &
	Partial<LinkAddressPropsViaColons>

export function CompactListingMolecule({
	description,
	imageSrc,
	title,
	href,
	hrefParams,
}: PropsForCompactListingMolecule) {
	const itemInternals = (
		<ItemInternals
			title={title}
			imageSrc={imageSrc}
			description={description}
		/>
	)
	if (!href) return itemInternals
	return (
		<InternalLinkAtom href={href} hrefParams={hrefParams}>
			{itemInternals}
		</InternalLinkAtom>
	)
}

/**
 * Draws the picture and words of one item, without the link around them.
 *
 * Takes everything but the address, which it does not draw. The wider type
 * would let a caller pass one and see nothing happen.
 */
function ItemInternals({
	description,
	imageSrc,
	title,
}: ContentForCompactListing) {
	return (
		<div class="grid grid-cols-[auto_1fr] gap-4 items-center">
			<img src={imageSrc} alt="" class="h-15" />
			<div>
				<h3 class="text-xl font-bold leading-none">{title}</h3>
				<p>{description}</p>
			</div>
		</div>
	)
}
