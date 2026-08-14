<script lang="ts">
	import { Level, H } from 'svelte-headings';
	import type { RouteId } from '$app/types';
	import { getFullAddress, type HrefParams } from '$lib/getFullAddress';

	export interface PropsForCompactListingMolecule {
		imageSrc: string;
		title: string;
		description: string;
		/**
		 * The page to link to. Leave it off to draw the item as plain content rather than a link.
		 * One with a `[name]` in it needs that piece in `hrefParams`.
		 */
		href?: RouteId;
		/** The pieces that complete the address, looked up by the name in the brackets. */
		hrefParams?: HrefParams;
	}

	const { description, imageSrc, title, href, hrefParams }: PropsForCompactListingMolecule =
		$props();
	const fullAddress = $derived(href ? getFullAddress(href, hrefParams) : undefined);
</script>

<!-- A snippet rather than two copies of the markup, so the linked and plain forms cannot drift apart. -->
{#snippet itemContent()}
	<div class="grid grid-cols-[auto_1fr] items-center gap-4">
		<img src={imageSrc} alt="" class="h-15" />
		<Level element="div">
			<H class="text-xl leading-none font-bold">{title}</H>
			<p>{description}</p>
		</Level>
	</div>
{/snippet}

{#if fullAddress}
	<!-- `getFullAddress` calls `resolve` itself, which the rule cannot see through. -->
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
	<a href={fullAddress} class="block">{@render itemContent()}</a>
{:else}
	{@render itemContent()}
{/if}
