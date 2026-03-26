import type { InputSignal, Type } from '@angular/core'

export interface IconProps {
	class?: string
	altText?: string
}

export type IconComponent = Type<{
	class: InputSignal<string>
	altText: InputSignal<string>
}>
