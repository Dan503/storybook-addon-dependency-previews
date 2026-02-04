<script lang="ts">
	import type { Snippet } from 'svelte';
	import HeaderOrganism from './HeaderOrganism.svelte';
	import FooterOrganism from './FooterOrganism.svelte';

	export interface PropsForSiteFrameOrganism {
		children?: Snippet;
	}

	const { children }: PropsForSiteFrameOrganism = $props();
</script>

<div class="SiteFrameOrganism grid min-h-full grid-rows-[auto_1fr_auto]">
	<HeaderOrganism />
	<div class="grid flex-1">
		{@render children?.()}
	</div>
	<FooterOrganism />
</div>
