import { Link, type ToPathOption } from '@tanstack/react-router'
import { H, Section } from 'react-headings'

export interface PropsForCardMolecule {
	href: ToPathOption
	title: string
	imgSrc: string
	description: string
}

export function CardMolecule({
	description,
	href,
	title,
	imgSrc,
}: PropsForCardMolecule) {
	return (
		<Link
			to={href}
			className="flex flex-col gap-2 border rounded-2xl overflow-hidden focus:bg-gray-200 hover:bg-gray-200 hover:shadow-lg hover:transform-[scale(1.02)] transition-all"
		>
			<img src={imgSrc} alt="" className="aspect-video object-cover" />
			<div className="p-4">
				<Section component={<H className="text-3xl font-bold">{title}</H>}>
					<p className="line-clamp-4">{description}</p>
				</Section>
			</div>
		</Link>
	)
}
