<script setup lang="ts">
export interface PropsForCompactListingMolecule {
	imageSrc: string
	title: string
	description: string
}

const { imageSrc, title, description } =
	defineProps<PropsForCompactListingMolecule>()
</script>

<template>
	<div class="grid grid-cols-[auto_1fr] items-center gap-4">
		<img :src="imageSrc" alt="" class="h-15" />
		<div>
			<h3 class="text-xl leading-none font-bold">{{ title }}</h3>
			<p>{{ description }}</p>
		</div>
	</div>
</template>
