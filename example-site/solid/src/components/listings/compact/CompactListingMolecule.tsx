export interface PropsForCompactListingMolecule {
	imageSrc: string
	title: string
	description: string
	href?: string
}

export function CompactListingMolecule({
	description,
	imageSrc,
	title,
	href,
}: PropsForCompactListingMolecule) {
	if (href) {
		return (
			<a href={href}>
				<ItemInternals
					title={title}
					imageSrc={imageSrc}
					description={description}
				/>
			</a>
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
		<div class="grid grid-cols-[auto_1fr] gap-4 items-center">
			<img src={imageSrc} alt="" class="h-15" />
			<div>
				<h3 class="text-xl font-bold leading-none">{title}</h3>
				<p>{description}</p>
			</div>
		</div>
	)
}
