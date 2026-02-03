<script lang="ts">
	import type { Snippet } from 'svelte';

	export interface PropsForButtonAtom {
		children?: Snippet;
	}

	const { children }: PropsForButtonAtom = $props();
</script>

<div class="ButtonAtom">
	<p>ButtonAtom</p>
	{@render children?.()}
</div>

<style>
	.ButtonAtom {
		/* styles go here */
	}
</style>
