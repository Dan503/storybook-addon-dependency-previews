<script lang="ts">
	import type { Snippet } from 'svelte'

	interface Props {
		children?: Snippet
	}

	const { children }: Props = $props()
</script>

<div class="ButtonAtom">
	<p>ButtonAtom</p>
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	.ButtonAtom {
		/* styles go here */
	}
</style>
