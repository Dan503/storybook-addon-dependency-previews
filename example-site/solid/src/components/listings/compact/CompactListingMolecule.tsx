import { Show } from 'solid-js'
import { InternalLinkAtom } from '../../01-atoms/InternalLinkAtom'
import type { RoutePath } from '../../../routePaths'

export interface PropsForCompactListingMolecule {
	imageSrc: string
	title: string
	description: string
	/** An address inside this site. Outside links belong in `ExternalLinkAtom`. */
	href?: RoutePath
}

export function CompactListingMolecule(props: PropsForCompactListingMolecule) {
	// Show rather than an early return, so that gaining or losing the address
	// swaps between the linked and plain forms. An early return is taken once
	// and cannot be undone.
	return (
		<Show
			when={props.href}
			fallback={
				<ItemInternals
					title={props.title}
					imageSrc={props.imageSrc}
					description={props.description}
				/>
			}
		>
			{(href) => (
				<InternalLinkAtom href={href()}>
					<ItemInternals
						title={props.title}
						imageSrc={props.imageSrc}
						description={props.description}
					/>
				</InternalLinkAtom>
			)}
		</Show>
	)
}

function ItemInternals(props: PropsForCompactListingMolecule) {
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
