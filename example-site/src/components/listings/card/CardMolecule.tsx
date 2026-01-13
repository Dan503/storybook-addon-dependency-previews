import { Link } from '@tanstack/react-router'
import { H, Section } from 'react-headings'
import type {
	RouterParams,
	RouterPaths,
} from '../../../utils/routerUtilityTypes'

export interface PropsForCardMolecule {
	title: string
	imgSrc: string
	description: string
	href: RouterPaths
	hrefParams?: RouterParams
}

export function CardMolecule({
	description,
	href,
	hrefParams,
	title,
	imgSrc,
}: PropsForCardMolecule) {
	return (
		<div className="@container">
			<Link
				to={href}
				params={hrefParams}
				className="h-full flex @max-md:flex-col gap-2 border rounded-2xl overflow-hidden bg-white focus:bg-teal-200 hover:bg-teal-200 hover:shadow-lg hover:transform-[scale(1.02)] transition-all"
			>
				<img
					src={imgSrc}
					alt=""
					className="aspect-video @md:aspect-square @md:w-40 object-cover"
				/>
				<div className="p-4">
					<Section component={<H className="text-3xl font-bold">{title}</H>}>
						<p className="line-clamp-4">{description}</p>
					</Section>
				</div>
			</Link>
		</div>
	)
}
