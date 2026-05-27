<script setup lang="ts">
import ScreenPaddingAtom, {
	type PropsForScreenPaddingAtom,
} from './ScreenPaddingAtom.vue'

export type PropsForContentRestraintAtom = PropsForScreenPaddingAtom

const { padVertical } = defineProps<PropsForContentRestraintAtom>()
</script>

<template>
	<ScreenPaddingAtom :pad-vertical="padVertical">
		<div
			class="ContentRestraintAtom grid grid-cols-[1fr_minmax(auto,800px)_1fr]"
		>
			<div class="width-full col-start-2 h-full">
				<slot />
			</div>
		</div>
	</ScreenPaddingAtom>
</template>
