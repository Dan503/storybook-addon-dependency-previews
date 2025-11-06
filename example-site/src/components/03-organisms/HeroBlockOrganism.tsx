import type { ReactNode } from 'react'
import { H, Section } from 'react-headings'
import { BgImageContainer } from '../01-atoms/BgImageContainer'
import { ScreenPaddingAtom } from '../01-atoms/ScreenPaddingAtom'

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
			className="HeroBlockOrganism text-center w-full min-h-100 grid place-items-center"
			imgSrc={imgSrc}
			altText={altText}
			tintColor={tintColor}
			tintPercent={tintPercent}
		>
			<ScreenPaddingAtom padVertical>
				<Section component={<H className="text-4xl font-bold">{title}</H>}>
					{children}
				</Section>
			</ScreenPaddingAtom>
		</BgImageContainer>
	)
}
