<script setup lang="ts">
import { computed } from 'vue'
import CardListTemplate from '../../components/04-templates/CardListTemplate.vue'
import type { PropsForCardMolecule } from '../../components/listings/card/CardMolecule.vue'
import { fetchCategories } from 'example-site-shared/utils/mealDbApiUtils'

const introText =
	'Explore a variety of food categories at The Meal Place! Discover new recipes, ingredients, and culinary inspiration.'

const { data: categories } = await useAsyncData('categories', () =>
	fetchCategories(),
)

const cardList = computed<Array<PropsForCardMolecule>>(() =>
	(categories.value ?? []).map((category) => ({
		title: category.strCategory,
		description: category.strCategoryDescription,
		imgSrc: category.strCategoryThumb,
		href: `/category/${category.strCategory}`,
	})),
)

useHead({ title: 'Categories' })
useSeoMeta({ description: introText })
</script>

<template>
	<CardListTemplate
		title="Food Categories"
		:introText="introText"
		:cardList="cardList"
	/>
</template>
