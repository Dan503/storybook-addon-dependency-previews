<script setup lang="ts">
import CompactListingMolecule, {
	type PropsForCompactListingMolecule,
} from './CompactListingMolecule.vue'

export interface PropsForCompactListingOrganism {
	items: Array<PropsForCompactListingMolecule>
}

const { items } = defineProps<PropsForCompactListingOrganism>()
</script>

<template>
	<ul class="CompactListingOrganism gap-4">
		<li v-for="item in items" :key="item.title">
			<CompactListingMolecule
				:imageSrc="item.imageSrc"
				:title="item.title"
				:description="item.description"
			/>
		</li>
	</ul>
</template>

<style scoped>
.CompactListingOrganism {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}
</style>
