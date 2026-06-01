<script setup lang="ts">
import SiteFrameOrganism from '../03-organisms/SiteFrameOrganism.vue'
import ScreenPaddingAtom from '../01-atoms/ScreenPaddingAtom.vue'
import CardListingOrganism from '../listings/card/CardListingOrganism.vue'
import type { PropsForCardMolecule } from '../listings/card/CardMolecule.vue'

export interface PropsForCardListTemplate {
	title: string
	introText?: string
	cardList?: Array<PropsForCardMolecule>
}

const { title, introText, cardList } = defineProps<PropsForCardListTemplate>()
</script>

<template>
	<SiteFrameOrganism>
		<ScreenPaddingAtom padVertical>
			<div class="MealListTemplate grid gap-4">
				<h1 class="text-4xl font-bold">{{ title }}</h1>
				<p class="mb-2">{{ introText }}</p>
				<CardListingOrganism :cards="cardList" />
			</div>
		</ScreenPaddingAtom>
	</SiteFrameOrganism>
</template>
