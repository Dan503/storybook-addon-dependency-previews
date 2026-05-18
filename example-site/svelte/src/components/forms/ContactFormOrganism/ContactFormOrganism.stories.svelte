<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import ContactFormOrganism from './ContactFormOrganism.svelte';
	import ContactFormOrganismStoryHarness from './ContactFormOrganismStoryHarness.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Forms / Contact Form Organism',
		component: ContactFormOrganism,
		tags: ['autodocs', 'organism'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});
</script>

<Story name="Primary">
	{#snippet template()}
		<ContactFormOrganismStoryHarness />
	{/snippet}
</Story>

<Story name="Error State">
	{#snippet template()}
		<ContactFormOrganismStoryHarness validate="initial" />
	{/snippet}
</Story>
