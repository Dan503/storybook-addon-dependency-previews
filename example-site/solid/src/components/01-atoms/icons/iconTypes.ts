import type { JSX, PropsWithChildren } from 'solid-js'

export type IconProps = PropsWithChildren<{
	className?: string
	altText?: string
}>

export type IconComponent = (props: IconProps) => JSX.Element

export type SvgAttributes = JSX.SvgSVGAttributes<SVGSVGElement>
