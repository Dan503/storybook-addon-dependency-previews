<script setup lang="ts">
import type { IconComponent } from '../01-atoms/icons/iconTypes'

export interface PropsForIconTextMolecule {
	Icon: IconComponent
}

const { Icon } = defineProps<PropsForIconTextMolecule>()
</script>

<template>
	<p
		class="IconTextMolecule flex items-center gap-1 text-lg font-medium text-gray-900"
	>
		<Icon class="h-[1em] w-[1em]" />
		<slot />
	</p>
</template>
