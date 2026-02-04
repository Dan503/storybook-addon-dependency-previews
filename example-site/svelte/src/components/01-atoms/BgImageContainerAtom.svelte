<script lang="ts">
	import type { Snippet } from 'svelte';

	export interface PropsForBgImageContainerAtom {
		imgSrc?: string;
		altText?: string;
		className?: string;
		innerClassName?: string;
		tintColor?: string;
		tintPercent?: number;
		children?: Snippet;
	}

	const {
		children,
		imgSrc,
		altText = '',
		className = '',
		tintColor = 'white',
		tintPercent = 70,
		innerClassName = ''
	}: PropsForBgImageContainerAtom = $props();
</script>

<div class={`BgImageContainerAtom relative ${className}`}>
	<img src={imgSrc} alt={altText} class="absolute top-0 left-0 h-full w-full object-cover" />
	<div
		class="absolute top-0 left-0 h-full w-full"
		style:background-color={tintColor}
		style:opacity={`${tintPercent}%`}
	></div>
	<div class={`relative z-10 grid ${innerClassName}`}>
		{@render children?.()}
	</div>
</div>
