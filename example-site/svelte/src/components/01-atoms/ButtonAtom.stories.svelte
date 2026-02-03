<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews'
	import ButtonAtom from './ButtonAtom.svelte'
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: '01 Atoms / Button Atom',
		component: ButtonAtom,
		tags: ['autodocs', 'atom'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url,
		} satisfies StoryParameters,
	})
</script>

<Story name="Primary" />
