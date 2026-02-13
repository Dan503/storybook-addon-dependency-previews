<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import CardListTemplate from './CardListTemplate.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: '04 Templates / Card List Template',
		component: CardListTemplate,
		tags: ['autodocs', 'template'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});
</script>

<Story name="Primary" />
