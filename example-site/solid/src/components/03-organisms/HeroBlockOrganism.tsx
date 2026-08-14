import type { JSX } from 'solid-js'
import { BgImageContainer } from '../01-atoms/BgImageContainer'
import { ScreenPaddingAtom } from '../01-atoms/ScreenPaddingAtom'

export interface PropsForHeroBlockOrganism {
	title: string | JSX.Element
	imgSrc?: string
	tintPercent?: number
	tintColor?: string
	altText?: string
	children?: JSX.Element
}

export function HeroBlockOrganism(props: PropsForHeroBlockOrganism) {
	return (
		<BgImageContainer
			className="HeroBlockOrganism text-center w-full min-h-100 grid place-items-center border-b-2 border-teal-900"
			imgSrc={props.imgSrc}
			altText={props.altText}
			tintColor={props.tintColor}
			tintPercent={props.tintPercent}
		>
			<ScreenPaddingAtom padVertical>
				<h1 class="text-4xl font-bold">{props.title}</h1>
				{props.children}
			</ScreenPaddingAtom>
		</BgImageContainer>
	)
}
