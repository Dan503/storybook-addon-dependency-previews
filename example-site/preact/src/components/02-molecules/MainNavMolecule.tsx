import { InternalLinkAtom } from '../01-atoms/InternalLinkAtom'

export interface PropsForMainNavMolecule {}

export function MainNavMolecule({}: PropsForMainNavMolecule) {
	return (
		<nav class="flex flex-row">
			<div class="px-2 font-bold">
				<InternalLinkAtom href="/" activeClass="underline" class="black">
					Home
				</InternalLinkAtom>
			</div>

			<div class="px-2 font-bold">
				<InternalLinkAtom
					href="/categories"
					activeClass="underline"
					class="black"
				>
					Food categories
				</InternalLinkAtom>
			</div>

			<div class="px-2 font-bold">
				<InternalLinkAtom href="/contact" activeClass="underline" class="black">
					Contact us
				</InternalLinkAtom>
			</div>
		</nav>
	)
}
