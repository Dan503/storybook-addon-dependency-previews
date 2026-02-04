<script lang="ts">
	import type { Snippet } from 'svelte';
	import ScreenPaddingAtom from './ScreenPaddingAtom.svelte';

	export interface PropsForContentRestraintAtom {
		children?: Snippet;
		padVertical?: boolean;
	}

	const { children, padVertical }: PropsForContentRestraintAtom = $props();
</script>

<ScreenPaddingAtom {padVertical}>
	<div class="ContentRestraintAtom grid grid-cols-[1fr_minmax(auto,800px)_1fr]">
		<div class="width-full col-start-2 h-full">{@render children?.()}</div>
	</div>
</ScreenPaddingAtom>
