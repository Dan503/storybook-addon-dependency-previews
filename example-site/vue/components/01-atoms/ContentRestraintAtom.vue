<script setup lang="ts">
import ScreenPaddingAtom from './ScreenPaddingAtom.vue'

export interface PropsForContentRestraintAtom {
	padVertical?: boolean
}

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
