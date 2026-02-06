<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import ChildContentAtom from './ChildContentAtom.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'ZZ Meta Components / Child Content Atom',
		component: ChildContentAtom,
		tags: ['autodocs', 'atom'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});
</script>

<Story name="Primary" />
