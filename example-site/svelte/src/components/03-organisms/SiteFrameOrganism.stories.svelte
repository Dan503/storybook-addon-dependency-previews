<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import ChildContentAtom from '../zz-meta-components/ChildContentAtom.svelte';
	import SiteFrameOrganism from './SiteFrameOrganism.svelte';

	const { Story } = defineMeta({
		title: '03 Organisms / Site Frame Organism',
		component: SiteFrameOrganism,
		tags: ['autodocs', 'organism'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});
</script>

<Story name="Primary">
	<ChildContentAtom />
</Story>
