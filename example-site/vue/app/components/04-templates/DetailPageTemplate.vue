<script setup lang="ts">
import { computed } from 'vue'
import type { Meal } from 'example-site-shared/data'
import ButtonAtom from '../01-atoms/ButtonAtom.vue'
import SiteFrameOrganism from '../03-organisms/SiteFrameOrganism.vue'
import ScreenPaddingAtom from '../01-atoms/ScreenPaddingAtom.vue'
import CompactListingOrganism from '../listings/compact/CompactListingOrganism.vue'

export interface PropsForDetailPageTemplate {
	meal: Meal | undefined | null
	isLoading?: boolean
}

const { meal, isLoading } = defineProps<PropsForDetailPageTemplate>()

const ingredientListItems = computed(() =>
	(meal?.ingredients ?? []).map((ingredient) => ({
		title: ingredient.ingredient,
		description: ingredient.amount,
		imageSrc: ingredient.imageUrl.small,
	})),
)

function goBack() {
	history.back()
}
</script>

<template>
	<SiteFrameOrganism>
		<ScreenPaddingAtom padVertical>
			<p v-if="isLoading">Loading...</p>
			<template v-else-if="!meal">
				<p class="mb-4">Meal not found.</p>
				<ButtonAtom :onClick="goBack">Go back</ButtonAtom>
			</template>
			<div v-else>
				<h1 class="mb-5 text-3xl font-bold">{{ meal.name }}</h1>
				<div class="grid gap-4 lg:grid-cols-[2fr_30rem]">
					<div class="grid gap-4 sm:grid-cols-[1fr_2fr]">
						<img :src="meal.image" :alt="meal.name" class="mt-2" />
						<div>
							<h2 class="text-2xl font-bold">Recipe</h2>
							<p class="whitespace-pre-wrap">{{ meal.instructions }}</p>
						</div>
					</div>
					<div class="grid grid-rows-[auto_1fr] items-start gap-4">
						<div>
							<h2 class="text-2xl font-bold">Ingredients</h2>
							<CompactListingOrganism :items="ingredientListItems" />
						</div>
					</div>
				</div>
			</div>
		</ScreenPaddingAtom>
	</SiteFrameOrganism>
</template>
