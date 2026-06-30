<script setup lang="ts">
export interface PropsForBgImageContainerAtom {
	className?: string
	imgSrc: string
	altText: string
	tintColor?: string
	tintPercent?: number
	innerClassName?: string
}

const {
	className,
	imgSrc,
	altText,
	tintColor = 'white',
	tintPercent = 70,
	innerClassName,
} = defineProps<PropsForBgImageContainerAtom>()
</script>

<template>
	<div class="BgImageContainerAtom relative" :class="className">
		<img
			:src="imgSrc"
			:alt="altText"
			class="absolute top-0 left-0 h-full w-full object-cover"
		/>
		<div
			class="absolute top-0 left-0 h-full w-full"
			:style="{
				backgroundColor: tintColor,
				opacity: tintPercent / 100,
			}"
		></div>
		<div class="relative z-10 grid" :class="innerClassName">
			<slot />
		</div>
	</div>
</template>
