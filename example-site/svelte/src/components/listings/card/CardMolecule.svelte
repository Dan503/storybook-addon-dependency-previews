<script lang="ts">
	import { H, Level } from 'svelte-headings';
	import type { RouteId } from '$app/types';
	import { getFullAddress, type HrefParams } from '$lib/getFullAddress';

	export interface PropsForCardMolecule {
		title: string;
		imgSrc: string;
		description: string;
		/** The page to link to. One with a `[name]` in it needs that piece in `hrefParams`. */
		href: RouteId;
		/** The pieces that complete the address, looked up by the name in the brackets. */
		hrefParams?: HrefParams;
	}

	const { title, imgSrc, description, href, hrefParams }: PropsForCardMolecule = $props();
	const fullAddress = $derived(getFullAddress(href, hrefParams));
</script>

<div class="CardMolecule @container grid">
	<!-- `getFullAddress` calls `resolve` itself, which the rule cannot see through. Turned off
	around the tag rather than for the line above it, because the address sits on its own line
	inside the tag and a next-line comment cannot reach in there. -->
	<!-- eslint-disable svelte/no-navigation-without-resolve -->
	<a
		href={fullAddress}
		class="flex h-full gap-2 overflow-hidden rounded-2xl border bg-white transition-all hover:transform-[scale(1.02)] hover:bg-teal-200 hover:shadow-lg focus:bg-teal-200"
	>
		<img src={imgSrc} alt="" class="aspect-video object-cover" />
		<Level class="w-full p-4">
			<H class="text-xl font-bold">{title}</H>
			<p class="line-clamp-4">{description}</p>
		</Level>
	</a>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
</div>

<style>
	.CardMolecule {
		@container (400px <= width) {
			img {
				width: 200px;
				aspect-ratio: 1 / 1;
			}
		}
		@container (width < 400px) {
			a {
				flex-direction: column;
			}
			img {
				width: 100%;
				aspect-ratio: 16 / 9;
			}
		}
	}
</style>
