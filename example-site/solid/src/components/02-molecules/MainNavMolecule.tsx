import { InternalLinkAtom } from '../01-atoms/InternalLinkAtom'
import { routePaths } from '../../routePaths'

export interface PropsForMainNavMolecule {}

export function MainNavMolecule({}: PropsForMainNavMolecule) {
	return (
		<nav class="flex flex-row">
			<div class="px-2 font-bold">
				{/* `end` stops Home being marked as the current page on every
				address, since every address starts with a slash. */}
				<InternalLinkAtom
					href={routePaths.home}
					activeClass="underline"
					end
				>
					Home
				</InternalLinkAtom>
			</div>

			<div class="px-2 font-bold">
				<InternalLinkAtom
					href={routePaths.categories}
					activeClass="underline"
				>
					Food categories
				</InternalLinkAtom>
			</div>

			<div class="px-2 font-bold">
				<InternalLinkAtom
					href={routePaths.contact}
					activeClass="underline"
				>
					Contact us
				</InternalLinkAtom>
			</div>
		</nav>
	)
}
