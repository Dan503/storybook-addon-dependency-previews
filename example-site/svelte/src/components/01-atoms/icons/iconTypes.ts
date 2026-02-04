import type { Component } from 'svelte';

export interface IconProps {
	class?: string;
	altText?: string;
}

export type IconComponent = Component<IconProps>;
