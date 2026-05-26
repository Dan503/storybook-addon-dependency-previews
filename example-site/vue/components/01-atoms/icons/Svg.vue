<script setup lang="ts">
import type { IconProps } from './iconTypes'

export interface PropsForSvg extends IconProps {}

const { altText, className } = defineProps<PropsForSvg>()
</script>

<template>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke-width="1.5"
		stroke="currentColor"
		height="24"
		width="24"
		focusable="false"
		role="img"
		:aria-label="altText || undefined"
		:aria-hidden="altText ? undefined : true"
		:class="className"
	>
		<slot />
	</svg>
</template>
