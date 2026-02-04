<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import MapPinIcon from './MapPinIcon.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: '01 Atoms / Icons / Map Pin Icon',
		component: MapPinIcon,
		tags: ['autodocs', 'icon'],
		parameters: {
			layout: 'centered',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});
</script>

<Story name="Primary" />
