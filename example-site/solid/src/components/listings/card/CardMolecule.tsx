export interface PropsForCardMolecule {
	title: string
	imgSrc: string
	description: string
	href: string
}

export function CardMolecule({
	description,
	href,
	title,
	imgSrc,
}: PropsForCardMolecule) {
	return (
		<div class="@container grid">
			<a
				href={href}
				class="h-full flex @max-sm:flex-col gap-2 border rounded-2xl overflow-hidden bg-white focus:bg-teal-200 hover:bg-teal-200 hover:shadow-lg hover:transform-[scale(1.02)] transition-all"
			>
				<img
					src={imgSrc}
					alt=""
					class="aspect-video @sm:aspect-square @sm:w-40 object-cover"
				/>
				<div class="p-4 w-full">
					<h3 class="text-xl font-bold">{title}</h3>
					<p class="line-clamp-4">{description}</p>
				</div>
			</a>
		</div>
	)
}
