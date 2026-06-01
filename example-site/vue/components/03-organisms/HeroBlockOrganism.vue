<script setup lang="ts">
import BgImageContainerAtom from '../01-atoms/BgImageContainerAtom.vue'
import ScreenPaddingAtom from '../01-atoms/ScreenPaddingAtom.vue'

export interface PropsForHeroBlockOrganism {
	title: string
	imgSrc?: string
	tintPercent?: number
	tintColor?: string
	altText?: string
}

const {
	title,
	imgSrc = '',
	tintPercent,
	tintColor,
	altText = '',
} = defineProps<PropsForHeroBlockOrganism>()
</script>

<template>
	<BgImageContainerAtom
		className="HeroBlockOrganism text-center w-full min-h-100 grid place-items-center border-b-2 border-teal-900"
		:imgSrc="imgSrc"
		:altText="altText"
		:tintColor="tintColor"
		:tintPercent="tintPercent"
	>
		<ScreenPaddingAtom padVertical>
			<!-- No need for a Level wrapper here because the Wrapper is in the SiteFrame component -->
			<h1 class="text-4xl font-bold">{{ title }}</h1>
			<slot />
		</ScreenPaddingAtom>
	</BgImageContainerAtom>
</template>
