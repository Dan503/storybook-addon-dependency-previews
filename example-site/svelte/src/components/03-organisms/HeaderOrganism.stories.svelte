<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import HeaderOrganism from './HeaderOrganism.svelte';

	const { Story } = defineMeta({
		title: '03 Organisms / Header Organism',
		component: HeaderOrganism,
		tags: ['autodocs', 'organism'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});
</script>

<Story name="Primary" />
