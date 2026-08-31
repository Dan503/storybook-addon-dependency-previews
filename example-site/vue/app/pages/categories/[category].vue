<script setup lang="ts">
import { computed } from 'vue'
import CardListTemplate from '../../components/04-templates/CardListTemplate.vue'
import { getMealCard } from '../../components/listings/card/CardMolecule.vue'
import { fetchMealsByCategory } from 'example-site-shared/utils/mealDbApiUtils'

const route = useRoute()
const category = computed(() => String(route.params.category))

const { data: mealList } = await useAsyncData(
	`category-${category.value}`,
	() => fetchMealsByCategory(category.value),
	{ watch: [category] },
)

const cardList = computed(() => (mealList.value ?? []).map(getMealCard))

useHead({ title: () => `${category.value} Meals` })
useSeoMeta({
	description:
		'Explore the delicious meals in this category! Click on any meal to discover its recipe, ingredients, and cooking instructions.',
})
</script>

<template>
	<CardListTemplate
		title="Meals in this category"
		introText="Explore the delicious meals in this category! Click on any meal to discover its recipe, ingredients, and cooking instructions."
		:cardList="cardList"
	/>
</template>
