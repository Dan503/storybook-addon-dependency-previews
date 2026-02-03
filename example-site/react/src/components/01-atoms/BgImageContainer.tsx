import type { ReactNode } from 'react'

export interface PropsForBgImageContainer {
	imgSrc?: string
	altText?: string
	className?: string
	innerClassName?: string
	tintColor?: string
	tintPercent?: number
	children?: ReactNode
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
		<div className={`BgImageContainer relative ${className}`}>
			<img
				src={imgSrc}
				alt={altText}
				className="object-cover h-full w-full absolute top-0 left-0"
			/>
			<div
				className="h-full w-full absolute top-0 left-0"
				style={{ backgroundColor: tintColor, opacity: `${tintPercent}%` }}
			></div>
			<div className={`grid relative z-10 ${innerClassName}`}>{children}</div>
		</div>
	)
}
