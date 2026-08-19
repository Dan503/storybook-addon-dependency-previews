<script lang="ts">
import type { Meal } from 'example-site-shared/data'
import type { HrefParams, RouteFileName } from 'example-site-shared/utils'

/**
 * A card that links to a page inside this site.
 *
 * The address arrives as `href` plus `hrefParams` rather than already finished,
 * so `href` only accepts an address the site actually has and a misspelt one
 * fails the type check. The card fills the changing piece in itself, because
 * `NuxtLink` takes a finished address.
 */
export interface PropsForCardMolecule {
	title: string
	imgSrc: string
	description: string
	/**
	 * Written the way this site names its pages, so `/meal/[mealId]` is the
	 * address `pages/meal/[mealId].vue` answers. Named as `RouteFileName` rather
	 * than written out as `LinkAddress<'[', ']'>` so the spelling is said once,
	 * where it can be changed once.
	 */
	href: RouteFileName
	hrefParams?: HrefParams
}

/**
 * Builds the card for one meal.
 *
 * Both lists that show meals — the featured ones on the home page and the ones
 * in a category — draw the same card from the same fields, so they share this
 * rather than each writing it out.
 *
 * @param meal - the meal the card stands for
 */
export function getMealCard(meal: Meal): PropsForCardMolecule {
	return {
		title: meal.name,
		description: meal.area,
		imgSrc: meal.image,
		href: '/meal/[mealId]',
		hrefParams: { mealId: meal.id },
	}
}
</script>

<script setup lang="ts">
import { getFullAddress } from '../../../app/lib/getFullAddress'

const { title, imgSrc, description, href, hrefParams } =
	defineProps<PropsForCardMolecule>()
</script>

<template>
	<div class="CardMolecule @container grid">
		<NuxtLink
			:to="getFullAddress({ href, hrefParams })"
			class="flex h-full gap-2 overflow-hidden rounded-2xl border bg-white transition-all hover:transform-[scale(1.02)] hover:bg-teal-200 hover:shadow-lg focus:bg-teal-200"
		>
			<img :src="imgSrc" alt="" class="aspect-video object-cover" />
			<div class="w-full p-4">
				<h2 class="text-xl font-bold">{{ title }}</h2>
				<p class="line-clamp-4">{{ description }}</p>
			</div>
		</NuxtLink>
	</div>
</template>

<style scoped>
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
