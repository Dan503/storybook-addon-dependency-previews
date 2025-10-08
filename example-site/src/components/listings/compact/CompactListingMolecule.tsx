import { Link, type ToPathOption } from '@tanstack/react-router'
import { H, Section } from 'react-headings'

export interface PropsForCompactListingMolecule {
	imageSrc: string
	title: string
	description: string
	href?: ToPathOption
}

export function CompactListingMolecule({
	description,
	imageSrc,
	title,
	href,
}: PropsForCompactListingMolecule) {
	if (href) {
		return (
			<Link to={href}>
				<ItemInternals
					title={title}
					imageSrc={imageSrc}
					description={description}
				/>
			</Link>
		)
	}
	return (
		<ItemInternals
			title={title}
			imageSrc={imageSrc}
			description={description}
		/>
	)
}

function ItemInternals({
	description,
	imageSrc,
	title,
}: PropsForCompactListingMolecule) {
	return (
		<div className="grid grid-cols-[auto_1fr] gap-4 items-center">
			<img src={imageSrc} alt="" className="h-15" />
			<div>
				<Section component={<H className="text-xl font-bold">{title}</H>}>
					<p>{description}</p>
				</Section>
			</div>
		</div>
	)
}
