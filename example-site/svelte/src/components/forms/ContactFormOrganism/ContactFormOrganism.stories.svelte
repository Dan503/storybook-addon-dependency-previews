<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import ContactFormOrganism from './ContactFormOrganism.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { ContactFormOutputData } from 'example-site-shared/data';

	const { Story } = defineMeta({
		title: 'Forms / Contact Form Organism',
		component: ContactFormOrganism,
		tags: ['autodocs', 'organism'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});

	function onSubmit(formOutput: ContactFormOutputData) {
		alert('Form submitted with these values:\n' + JSON.stringify(formOutput, null, 2));
	}
</script>

<Story name="Primary">
	{#snippet template()}
		<ContactFormOrganism {onSubmit} />
	{/snippet}
</Story>
