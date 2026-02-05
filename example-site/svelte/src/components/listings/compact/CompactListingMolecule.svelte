<script lang="ts">
	import { Level, H } from 'svelte-headings';

	export interface PropsForCompactListingMolecule {
		imageSrc: string;
		title: string;
		description: string;
		href?: string;
	}

	const { description, imageSrc, title, href }: PropsForCompactListingMolecule = $props();
</script>

<div class="grid grid-cols-[auto_1fr] items-center gap-4">
	<img src={imageSrc} alt="" class="h-15" />
	<Level element="div">
		<H class="text-xl leading-none font-bold">{title}</H>
		<p>{description}</p>
	</Level>
</div>

<!-- 

<div class="CompactListingMolecule">
	<p>CompactListingMolecule</p>
	{@render children?.()}
</div> -->

<style>
	.CompactListingMolecule {
		/* styles go here */
	}
</style>
