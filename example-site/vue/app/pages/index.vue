<script setup lang="ts">
import HomeTemplate from '../../components/04-templates/HomeTemplate.vue'
import { fetchRandomMealList } from 'example-site-shared/utils/mealDbApiUtils'

const { data: featuredMeals } = await useAsyncData('featured-meals', () =>
	fetchRandomMealList(7),
)

useHead({ title: 'The Meal Place' })
useSeoMeta({
	description:
		'This is an example site to demonstrate the dependency preview addon in a realistic environment.',
})
</script>

<template>
	<HomeTemplate :featuredMeals="featuredMeals ?? []" />
</template>
