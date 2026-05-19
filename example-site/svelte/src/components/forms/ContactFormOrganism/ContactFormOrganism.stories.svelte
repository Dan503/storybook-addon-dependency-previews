<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import ContactFormOrganism from './ContactFormOrganism.svelte';
	import ContactFormOrganismDecorator from './ContactFormOrganism.decorator.svelte';
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
		<ContactFormOrganismDecorator />
	{/snippet}
</Story>

<Story name="Error State">
	{#snippet template()}
		<ContactFormOrganismDecorator validate="initial" />
	{/snippet}
</Story>
