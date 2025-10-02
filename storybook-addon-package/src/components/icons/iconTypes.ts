import type { ReactElement } from 'react'

export interface IconProps {
	className: string
}

export type IconComponent = (props: IconProps) => ReactElement
