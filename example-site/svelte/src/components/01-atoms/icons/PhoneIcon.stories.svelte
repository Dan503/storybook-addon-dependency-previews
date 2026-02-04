<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import PhoneIcon from './PhoneIcon.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: '01 Atoms / Icons / Phone Icon',
		component: PhoneIcon,
		tags: ['autodocs', 'icon'],
		parameters: {
			layout: 'centered',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});
</script>

<Story name="Primary" />
