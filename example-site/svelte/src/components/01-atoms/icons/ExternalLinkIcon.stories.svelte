<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import ExternalLinkIcon from './ExternalLinkIcon.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: '01 Atoms / Icons / External Link Icon',
		component: ExternalLinkIcon,
		tags: ['autodocs', 'icon'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});
</script>

<Story name="Primary" />
