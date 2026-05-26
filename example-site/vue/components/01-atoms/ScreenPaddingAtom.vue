<script setup lang="ts">
export interface PropsForScreenPaddingAtom {
	padVertical?: boolean
}

const { padVertical } = defineProps<PropsForScreenPaddingAtom>()
</script>

<template>
	<div class="ScreenPaddingAtom w-full" :class="padVertical ? 'p-6' : 'px-6'">
		<slot />
	</div>
</template>
