<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import ContactFormOrganism from './ContactFormOrganism.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { defaultContactFormValues, type ContactFormValues } from 'example-site-shared/data';

	const { Story } = defineMeta({
		title: 'Forms / Contact Form Organism',
		component: ContactFormOrganism,
		tags: ['autodocs', 'organism'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});

	let formValues: ContactFormValues = $state(defaultContactFormValues);

	function onSubmit() {
		alert('Form submitted with these values:\n' + JSON.stringify(formValues, null, 2));
	}
</script>

<Story name="Primary">
	{#snippet template()}
		<ContactFormOrganism {onSubmit} bind:formValues />
	{/snippet}
</Story>
