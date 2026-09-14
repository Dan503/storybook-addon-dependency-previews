import type { VNode } from 'preact'

export interface IconProps {
	className?: string
	altText?: string
}

export type IconComponent = (props: IconProps) => VNode
