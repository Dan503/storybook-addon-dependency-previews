<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import ContactTemplate from './ContactTemplate.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: '04 Templates / Contact Template',
		component: ContactTemplate,
		tags: ['autodocs', 'template'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});
</script>

<Story name="Primary">
	<p>04 Templates / Contact Template</p>
</Story>
