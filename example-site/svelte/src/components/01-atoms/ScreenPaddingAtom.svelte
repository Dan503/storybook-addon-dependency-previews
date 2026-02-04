<script lang="ts">
	import type { Snippet } from 'svelte';

	export interface PropsForScreenPaddingAtom {
		children?: Snippet;
		padVertical?: boolean;
	}

	const { children, padVertical = false }: PropsForScreenPaddingAtom = $props();
</script>

<div class={`ScreenPaddingAtom ${padVertical ? 'p-6' : 'px-6'} w-full`}>
	{@render children?.()}
</div>
