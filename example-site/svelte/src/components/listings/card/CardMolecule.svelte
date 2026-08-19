<script lang="ts" module>
	import type { Meal } from 'example-site-shared/data';
	import type { LinkAddress } from '$lib/getFullAddress';

	export type PropsForCardMolecule = LinkAddress & {
		title: string;
		imgSrc: string;
		description: string;
	};

	/**
	 * Builds the card for one meal.
	 *
	 * Both lists that show meals — the featured ones on the home page and the ones in a category —
	 * draw the same card from the same fields, so they share this rather than each writing it out.
	 *
	 * @param meal - the meal the card stands for
	 */
	export function getMealCard(meal: Meal): PropsForCardMolecule {
		return {
			title: meal.name,
			description: meal.area,
			imgSrc: meal.image,
			href: '/meal/[mealId]',
			hrefParams: { mealId: meal.id }
		};
	}
</script>

<script lang="ts">
	import { H, Level } from 'svelte-headings';
	import { getFullAddress } from '$lib/getFullAddress';

	const { title, imgSrc, description, href, hrefParams }: PropsForCardMolecule = $props();
	const fullAddress = $derived(getFullAddress(href, hrefParams));
</script>

<div class="CardMolecule @container grid">
	<!-- `getFullAddress` calls `resolve` itself, which the rule cannot see through. Turned off
	around the whole tag because the address sits on its own line inside it. -->
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
