import { ScreenPaddingAtom } from '../01-atoms/ScreenPaddingAtom'
import { MainNavMolecule } from '../02-molecules/MainNavMolecule'

export function HeaderOrganism() {
	return (
		<header className="p-2 bg-teal-100 border-b-2 border-teal-900 text-black">
			<ScreenPaddingAtom>
				<div className="flex w-full items-center justify-between gap-2 max-md:flex-col max-md:justify-center">
					<div className="flex items-center gap-2">
						<img src="/simplified-logo.png" alt="Logo" height={50} width={50} />
						<p className="font-extrabold text-3xl">The Meal Place</p>
					</div>
					<MainNavMolecule />
				</div>
			</ScreenPaddingAtom>
		</header>
	)
}
