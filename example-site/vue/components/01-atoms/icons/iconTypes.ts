import type { Component } from 'vue'

export interface IconProps {
	className?: string
	altText?: string
}

export type IconComponent = Component<IconProps>
