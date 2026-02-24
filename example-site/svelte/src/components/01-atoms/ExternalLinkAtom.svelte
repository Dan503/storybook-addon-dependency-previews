<script lang="ts">
	import type { Snippet } from 'svelte';
	import ExternalLinkIcon from './icons/ExternalLinkIcon.svelte';

	export interface PropsForExternalLinkAtom {
		href: string;
		class?: string;
		children?: Snippet;
	}

	const { href, class: className, children }: PropsForExternalLinkAtom = $props();
</script>

<a
	class="ExternalLinkAtom inline-flex items-center gap-1 text-teal-700 underline hover:text-teal-900 hover:no-underline focus:no-underline {className}"
	target="_blank"
	rel="noopener noreferrer"
	{href}
	title="Opens in new tab"
>
	{@render children?.()}
	<ExternalLinkIcon class="h-[1em] w-[1em]" />
</a>
