<script setup lang="ts">
import { computed } from 'vue'
import DetailPageTemplate from '../../../components/04-templates/DetailPageTemplate.vue'
import { fetchMealById } from 'example-site-shared/utils/mealDbApiUtils'

const route = useRoute()
const mealId = computed(() => String(route.params.mealId))

const { data: meal, status } = await useAsyncData(
	`meal-${mealId.value}`,
	() => fetchMealById(mealId.value),
	{ watch: [mealId] },
)

useHead({ title: () => meal.value?.name ?? 'Meal' })
useSeoMeta({
	description: () =>
		`Learn more about ${meal.value?.name ?? 'this meal'} at The Meal Place! Discover its recipe, ingredients, and cooking instructions.`,
})
</script>

<template>
	<DetailPageTemplate :meal="meal" :isLoading="status === 'pending'" />
</template>
