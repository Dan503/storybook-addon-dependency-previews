<script lang="ts">
	import type { Snippet } from 'svelte';

	export interface PropsForButtonAtom {
		type?: 'button' | 'submit' | 'reset';
		onClick?: (event: MouseEvent) => void;
		children?: Snippet;
	}

	const { children, type, onClick }: PropsForButtonAtom = $props();
</script>

<button
	{type}
	onclick={onClick}
	class="ButtonAtom rounded-lg border-2 border-teal-900 bg-teal-200 px-4 py-1 hover:bg-teal-100 focus:bg-teal-100"
>
	{@render children?.()}
</button>
