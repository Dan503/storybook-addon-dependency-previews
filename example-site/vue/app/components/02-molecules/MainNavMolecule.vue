<script setup lang="ts">
import InternalLinkAtom from '../01-atoms/InternalLinkAtom.vue'

export interface PropsForMainNavMolecule {}

const {} = defineProps<PropsForMainNavMolecule>()
</script>

<template>
	<nav class="MainNavMolecule flex flex-row gap-4 font-bold">
		<!--
			vue-router works out which link is the current page by which page files
			answer the address on screen, rather than by one address starting with the
			same text as another. So Home needs nothing extra to keep it from being
			underlined on every page. "Food categories" covers a category page as
			well, and `pages/categories.vue` says why.
		-->
		<InternalLinkAtom href="/" activeClass="underline">Home</InternalLinkAtom>
		<InternalLinkAtom href="/categories" activeClass="underline"
			>Food categories</InternalLinkAtom
		>
		<InternalLinkAtom href="/contact" activeClass="underline"
			>Contact us</InternalLinkAtom
		>
	</nav>
</template>
