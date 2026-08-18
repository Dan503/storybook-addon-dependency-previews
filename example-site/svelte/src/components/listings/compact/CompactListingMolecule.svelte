<script lang="ts">
	import { Level, H } from 'svelte-headings';
	import { getOptionalFullAddress, type OptionalLinkAddress } from '$lib/getFullAddress';

	/**
	 * The address is optional — without one the item draws as plain content rather than a link.
	 * Addresses outside this site belong in `ExternalLinkAtom`.
	 */
	export type PropsForCompactListingMolecule = {
		imageSrc: string;
		title: string;
		description: string;
	} & OptionalLinkAddress;

	const { description, imageSrc, title, href, hrefParams }: PropsForCompactListingMolecule =
		$props();
	const fullAddress = $derived(getOptionalFullAddress(href, hrefParams));
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
