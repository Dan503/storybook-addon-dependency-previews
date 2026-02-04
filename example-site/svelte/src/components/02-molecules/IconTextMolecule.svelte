<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { IconComponent } from '../01-atoms/icons/iconTypes';

	export interface PropsForIconTextMolecule {
		Icon: IconComponent;
		children?: Snippet;
	}

	const { children, Icon }: PropsForIconTextMolecule = $props();
</script>

<p class="IconTextMolecule flex items-center gap-1 text-lg font-medium text-gray-900">
	<Icon class="h-[1em] w-[1em]" />
	{@render children?.()}
</p>
