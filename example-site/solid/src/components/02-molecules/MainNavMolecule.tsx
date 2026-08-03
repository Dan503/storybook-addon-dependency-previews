export interface PropsForMainNavMolecule {}

export function MainNavMolecule({}: PropsForMainNavMolecule) {
	return (
		<nav class="flex flex-row">
			<div class="px-2 font-bold">
				<a href="/">Home</a>
			</div>

			<div class="px-2 font-bold">
				<a href="/categories">Food categories</a>
			</div>

			<div class="px-2 font-bold">
				<a href="/contact">Contact us</a>
			</div>
		</nav>
	)
}
