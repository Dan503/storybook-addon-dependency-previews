<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Level } from 'svelte-headings';

	let { children }: { children: Snippet } = $props();
</script>

<!--
	This is a simple decorator component that wraps all stories in a <Level> component
	from svelte-headings to ensure consistent heading levels across stories.
	It's used in the Storybook preview configuration to wrap all stories.
-->
<Level>
	{@render children?.()}
</Level>
