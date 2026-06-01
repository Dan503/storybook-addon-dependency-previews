<script setup lang="ts">
import CardMolecule, { type PropsForCardMolecule } from './CardMolecule.vue'

export interface PropsForCardListingOrganism {
	cards: Array<PropsForCardMolecule> | undefined
}

const { cards } = defineProps<PropsForCardListingOrganism>()
</script>

<template>
	<div class="@container grid">
		<div
			class="CardListingOrganism grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6"
		>
			<CardMolecule
				v-for="card in cards"
				:key="card.title"
				:title="card.title"
				:imgSrc="card.imgSrc"
				:description="card.description"
				:href="card.href"
			/>
		</div>
	</div>
</template>

<style scoped>
.CardListingOrganism {
	grid-template-columns: repeat(3, minmax(0, 1fr));

	@container (width < 800px) {
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	}

	@container (width > 1400px) {
		grid-template-columns: repeat(6, minmax(0, 1fr));
	}
}
</style>
