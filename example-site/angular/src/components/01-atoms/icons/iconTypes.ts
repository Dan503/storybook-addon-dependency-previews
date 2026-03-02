import type { Type } from '@angular/core'

export interface IconProps {
	ariaLabel?: string
	size?: string
}

export type IconComponent = Type<IconProps>
