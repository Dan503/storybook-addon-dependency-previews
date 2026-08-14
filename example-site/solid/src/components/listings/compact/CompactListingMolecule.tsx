import { Show } from 'solid-js'
import type { LinkAddress } from 'example-site-shared/utils'
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
	Partial<LinkAddress>

export function CompactListingMolecule(props: PropsForCompactListingMolecule) {
	// A function, so that both branches below draw it from the current values
	// rather than one copy going stale.
	const itemInternals = () => (
		<ItemInternals
			title={props.title}
			imageSrc={props.imageSrc}
			description={props.description}
		/>
	)
	// Show rather than an early return, so that gaining or losing the address
	// swaps between the linked and plain forms. An early return is taken once
	// and cannot be undone.
	return (
		<Show when={props.href} fallback={itemInternals()}>
			{(href) => (
				<InternalLinkAtom href={href()} hrefParams={props.hrefParams}>
					{itemInternals()}
				</InternalLinkAtom>
			)}
		</Show>
	)
}

// Takes everything but the address, which it does not draw. The wider type
// would let a caller pass one and see nothing happen.
function ItemInternals(props: ContentForCompactListing) {
	return (
		<div class="grid grid-cols-[auto_1fr] gap-4 items-center">
			<img src={props.imageSrc} alt="" class="h-15" />
			<div>
				<h3 class="text-xl font-bold leading-none">{props.title}</h3>
				<p>{props.description}</p>
			</div>
		</div>
	)
}
