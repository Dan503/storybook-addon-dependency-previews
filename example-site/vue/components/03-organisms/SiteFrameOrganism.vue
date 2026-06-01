<script setup lang="ts">
import HeaderOrganism from './HeaderOrganism.vue'
import FooterOrganism from './FooterOrganism.vue'

export interface PropsForSiteFrameOrganism {}

const {} = defineProps<PropsForSiteFrameOrganism>()
</script>

<template>
	<div class="SiteFrameOrganism grid min-h-full grid-rows-[auto_1fr_auto]">
		<HeaderOrganism />
		<div class="grid flex-1">
			<slot />
		</div>
		<FooterOrganism />
	</div>
</template>
