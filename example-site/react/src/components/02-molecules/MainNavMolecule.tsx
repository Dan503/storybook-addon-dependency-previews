import { Link } from '@tanstack/react-router'

export interface PropsForMainNavMolecule {}

export function MainNavMolecule({}: PropsForMainNavMolecule) {
	return (
		<nav className="flex flex-row">
			<div className="px-2 font-bold">
				<Link to="/">Home</Link>
			</div>

			<div className="px-2 font-bold">
				<Link to="/categories">Food categories</Link>
			</div>

			<div className="px-2 font-bold">
				<Link to="/contact">Contact us</Link>
			</div>
		</nav>
	)
}
