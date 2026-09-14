import { InternalLinkAtom } from '../01-atoms/InternalLinkAtom'
import { ScreenPaddingAtom } from '../01-atoms/ScreenPaddingAtom'
import { MainNavMolecule } from '../02-molecules/MainNavMolecule'

export function HeaderOrganism() {
	return (
		<header class="p-2 bg-teal-100 border-b-2 border-teal-900 text-black">
			<ScreenPaddingAtom>
				<div class="flex w-full items-center justify-between gap-2 max-md:flex-col max-md:justify-center">
					<InternalLinkAtom href="/" class="flex items-center gap-2">
						<img src="/simplified-logo.png" alt="Logo" height={50} width={50} />
						<p class="font-extrabold text-3xl">The Meal Place</p>
					</InternalLinkAtom>
					<MainNavMolecule />
				</div>
			</ScreenPaddingAtom>
		</header>
	)
}
