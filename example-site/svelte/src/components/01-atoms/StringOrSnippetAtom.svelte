<script lang="ts">
	import type { Snippet } from 'svelte';

	export interface PropsForStringOrSnippetAtom {
		value?: string | Snippet;
	}

	const { value }: PropsForStringOrSnippetAtom = $props();
</script>

{#if typeof value === 'function'}
	{@render value()}
{:else}
	{value}
{/if}
