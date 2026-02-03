<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import ButtonAtom, { type PropsForButtonAtom } from './ButtonAtom.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: '01 Atoms / Button Atom',
		component: ButtonAtom,
		tags: ['autodocs', 'atom'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});
	type Args = Omit<PropsForButtonAtom, 'children'>;
</script>

<Story name="Primary" args={{} satisfies Args}>
	<p>01 Atoms / Button Atom</p>
</Story>
