import { mergeProps } from 'solid-js'
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

export function BgImageContainer(props: PropsForBgImageContainer) {
	const mergedProps = mergeProps(
		{
			altText: '',
			className: '',
			tintColor: 'white',
			tintPercent: 70,
			innerClassName: '',
		},
		props,
	)
	return (
		<div class={`BgImageContainer relative ${mergedProps.className}`}>
			<img
				src={mergedProps.imgSrc}
				alt={mergedProps.altText}
				class="object-cover h-full w-full absolute top-0 left-0"
			/>
			<div
				class="h-full w-full absolute top-0 left-0"
				style={{
					'background-color': mergedProps.tintColor,
					opacity: `${mergedProps.tintPercent}%`,
				}}
			></div>
			<div class={`grid relative z-10 ${mergedProps.innerClassName}`}>
				{mergedProps.children}
			</div>
		</div>
	)
}
