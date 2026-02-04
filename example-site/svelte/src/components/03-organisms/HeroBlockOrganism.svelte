<script lang="ts">
	import type { Snippet } from 'svelte';
	import BgImageContainerAtom from '../01-atoms/BgImageContainerAtom.svelte';
	import ScreenPaddingAtom from '../01-atoms/ScreenPaddingAtom.svelte';

	export interface PropsForHeroBlockOrganism {
		title: string | Snippet;
		imgSrc?: string;
		tintPercent?: number;
		tintColor?: string;
		altText?: string;
		children?: Snippet;
	}

	const { children, title, imgSrc, tintPercent, tintColor, altText }: PropsForHeroBlockOrganism =
		$props();
</script>

<BgImageContainerAtom
	className="HeroBlockOrganism text-center w-full min-h-100 grid place-items-center border-b-2 border-teal-900"
	{imgSrc}
	{altText}
	{tintColor}
	{tintPercent}
>
	<ScreenPaddingAtom padVertical>
		<h1 class="text-4xl font-bold">{title}</h1>
		{@render children?.()}
	</ScreenPaddingAtom>
</BgImageContainerAtom>
