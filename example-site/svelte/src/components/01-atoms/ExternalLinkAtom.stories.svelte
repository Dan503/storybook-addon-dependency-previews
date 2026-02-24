<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import ExternalLinkAtom, { type PropsForExternalLinkAtom } from './ExternalLinkAtom.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: '01 Atoms / External Link Atom',
		component: ExternalLinkAtom,
		tags: ['autodocs', 'atom'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});
	type Args = Omit<PropsForExternalLinkAtom, 'children'>;
</script>

<Story
	name="Primary"
	args={{ href: 'https://github.com/Dan503/storybook-addon-dependency-previews' } satisfies Args}
>
	Storybook Dependency Previews on GitHub
</Story>
