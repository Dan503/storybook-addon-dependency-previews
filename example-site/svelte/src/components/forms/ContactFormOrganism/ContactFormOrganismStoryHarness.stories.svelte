<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews'
	import ContactFormOrganismStoryHarness, { type PropsForContactFormOrganismStoryHarness } from './ContactFormOrganismStoryHarness.svelte'
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Forms / Contact Form Organism / Contact Form Organism Story Harness',
		component: ContactFormOrganismStoryHarness,
		tags: ['autodocs', 'organism'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url,
		} satisfies StoryParameters,
	})
	type Args = Omit<PropsForContactFormOrganismStoryHarness, 'children'>;
</script>

<Story name="Primary" args={{} satisfies Args}>
	<p>Forms / Contact Form Organism / Contact Form Organism Story Harness</p>
</Story>
