<script setup lang="ts">
import ExternalLinkIcon from './icons/ExternalLinkIcon.vue'

export interface PropsForExternalLinkAtom {
	href: string
}

const { href } = defineProps<PropsForExternalLinkAtom>()
</script>

<template>
	<a
		class="ExternalLinkAtom inline-flex items-center gap-1 text-teal-700 underline hover:text-teal-900 hover:no-underline focus:no-underline"
		:class="$attrs.class"
		target="_blank"
		rel="noopener noreferrer"
		:href="href"
		title="Opens in new tab"
	>
		<slot />
		<ExternalLinkIcon class="h-[1em] w-[1em]" />
	</a>
</template>
