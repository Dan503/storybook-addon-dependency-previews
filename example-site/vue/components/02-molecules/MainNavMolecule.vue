<script setup lang="ts">
import { useActiveNavItem } from '../../app/composables/useActiveNavItem'

export interface PropsForMainNavMolecule {}

const {} = defineProps<PropsForMainNavMolecule>()

const activeNavItem = useActiveNavItem()
</script>

<template>
	<nav class="MainNavMolecule flex flex-row gap-4 font-bold">
		<NuxtLink to="/" :class="{ underline: activeNavItem === 'home' }"
			>Home</NuxtLink
		>
		<NuxtLink
			to="/categories"
			:class="{ underline: activeNavItem === 'categories' }"
			>Food categories</NuxtLink
		>
		<NuxtLink
			to="/contact"
			:class="{ underline: activeNavItem === 'contact' }"
			>Contact us</NuxtLink
		>
	</nav>
</template>
