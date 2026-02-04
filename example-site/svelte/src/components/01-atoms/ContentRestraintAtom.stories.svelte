<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import ChildContentAtom from '../zz-meta-components/ChildContentAtom.svelte';
	import ContentRestraintAtom from './ContentRestraintAtom.svelte';

	const { Story } = defineMeta({
		title: '01 Atoms / Content Restraint Atom',
		component: ContentRestraintAtom,
		tags: ['autodocs', 'atom'],
		parameters: {
			layout: 'fullscreen',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});
</script>

<Story name="Primary">
	<ChildContentAtom />
</Story>
