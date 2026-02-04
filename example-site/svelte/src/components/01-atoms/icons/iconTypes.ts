import type { Snippet } from 'svelte';

export interface IconProps {
	class?: string;
	altText?: string;
}

export type IconComponent = (props: IconProps) => Snippet;
