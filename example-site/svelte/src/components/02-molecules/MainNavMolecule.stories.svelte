<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import MainNavMolecule from './MainNavMolecule.svelte';

	const { Story } = defineMeta({
		title: '02 Molecules / Main Nav Molecule',
		component: MainNavMolecule,
		tags: ['autodocs', 'molecule'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});
</script>

<Story name="Primary" />
