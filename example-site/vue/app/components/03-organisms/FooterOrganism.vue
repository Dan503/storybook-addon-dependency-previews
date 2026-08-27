<script setup lang="ts">
import ExternalLinkAtom from '../01-atoms/ExternalLinkAtom.vue'

export interface PropsForFooterOrganism {}

const {} = defineProps<PropsForFooterOrganism>()
</script>

<template>
	<div
		class="FooterOrganism border-t-2 border-teal-900 bg-teal-200 p-4 text-center text-black"
	>
		<p>
			Meal data provided by{{ ' ' }}
			<ExternalLinkAtom href="https://www.themealdb.com/"
				>TheMealDB.com</ExternalLinkAtom
			>
		</p>
	</div>
</template>
