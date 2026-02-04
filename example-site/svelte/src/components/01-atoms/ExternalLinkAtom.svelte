<script lang="ts">
	import type { Snippet } from 'svelte';
	import ExternalLinkIcon from './icons/ExternalLinkIcon.svelte';

	export interface PropsForExternalLinkAtom {
		href: string;
		children?: Snippet;
	}

	const { href, children }: PropsForExternalLinkAtom = $props();
</script>

<a
	class="ExternalLinkAtom inline-flex items-center gap-1 text-teal-700 hover:text-teal-900 hover:underline"
	target="_blank"
	rel="noopener noreferrer"
	{href}
	title="Opens in new tab"
>
	{@render children?.()}
	<ExternalLinkIcon class="h-[1em] w-[1em]" />
</a>
