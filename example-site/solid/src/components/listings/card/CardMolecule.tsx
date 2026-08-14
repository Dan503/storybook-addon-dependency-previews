import { InternalLinkAtom } from '../../01-atoms/InternalLinkAtom'
import type { RoutePath } from '../../../routePaths'

export interface PropsForCardMolecule {
	title: string
	imgSrc: string
	description: string
	href: RoutePath
}

export function CardMolecule(props: PropsForCardMolecule) {
	return (
		<div class="@container grid">
			<InternalLinkAtom
				href={props.href}
				class="h-full flex @max-sm:flex-col gap-2 border rounded-2xl overflow-hidden bg-white focus:bg-teal-200 hover:bg-teal-200 hover:shadow-lg hover:transform-[scale(1.02)] transition-all"
			>
				<img
					src={props.imgSrc}
					alt=""
					class="aspect-video @sm:aspect-square @sm:w-40 object-cover"
				/>
				<div class="p-4 w-full">
					<h3 class="text-xl font-bold">{props.title}</h3>
					<p class="line-clamp-4">{props.description}</p>
				</div>
			</InternalLinkAtom>
		</div>
	)
}
