import type { ReactNode } from 'react'
import { BgImageContainer } from '../atoms/BgImageContainer'
import { H, Section } from 'react-headings'

export interface PropsForHeroBlockOrganism {
	title: string
	imgSrc?: string
	tintPercent?: number
	tintColor?: string
	altText?: string
	children?: ReactNode
}

export function HeroBlockOrganism({
	title,
	children,
	imgSrc,
	altText,
	tintColor,
	tintPercent,
}: PropsForHeroBlockOrganism) {
	return (
		<BgImageContainer
			className="HeroBlockOrganism p-4 text-center w-full aspect-video grid place-items-center"
			imgSrc={imgSrc}
			altText={altText}
			tintColor={tintColor}
			tintPercent={tintPercent}
		>
			<Section component={<H className="text-4xl font-bold">{title}</H>}>
				{children}
			</Section>
		</BgImageContainer>
	)
}
