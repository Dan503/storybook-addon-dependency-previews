import type { JSX } from 'solid-js'

export interface PropsForBgImageContainer {
	imgSrc?: string
	altText?: string
	className?: string
	innerClassName?: string
	tintColor?: string
	tintPercent?: number
	children?: JSX.Element
}

export function BgImageContainer({
	children,
	imgSrc,
	altText = '',
	className = '',
	tintColor = 'white',
	tintPercent = 70,
	innerClassName = '',
}: PropsForBgImageContainer) {
	return (
		<div class={`BgImageContainer relative ${className}`}>
			<img
				src={imgSrc}
				alt={altText}
				class="object-cover h-full w-full absolute top-0 left-0"
			/>
			<div
				class="h-full w-full absolute top-0 left-0"
				style={{
					'background-color': tintColor,
					opacity: `${tintPercent}%`,
				}}
			></div>
			<div class={`grid relative z-10 ${innerClassName}`}>{children}</div>
		</div>
	)
}
