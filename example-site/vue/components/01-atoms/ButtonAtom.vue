<script setup lang="ts">
export interface PropsForButtonAtom {
	type?: 'button' | 'submit' | 'reset'
	onClick?: (event: MouseEvent) => void
}

const { type = 'button', onClick } = defineProps<PropsForButtonAtom>()
</script>

<template>
	<button
		:type="type"
		class="rounded-lg border-2 border-teal-900 bg-teal-200 px-4 py-1 hover:bg-teal-100 focus:bg-teal-100"
		@click="onClick"
	>
		<slot />
	</button>
</template>
