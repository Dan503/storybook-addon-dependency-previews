<script lang="ts">
	import type { Snippet } from 'svelte';
	import HeaderOrganism from './HeaderOrganism.svelte';
	import FooterOrganism from './FooterOrganism.svelte';
	import { Level } from 'svelte-headings';

	export interface PropsForSiteFrameOrganism {
		children?: Snippet;
	}

	const { children }: PropsForSiteFrameOrganism = $props();
</script>

<Level class="SiteFrameOrganism grid min-h-full grid-rows-[auto_1fr_auto]">
	<HeaderOrganism />
	<div class="grid flex-1">
		{@render children?.()}
	</div>
	<FooterOrganism />
</Level>
