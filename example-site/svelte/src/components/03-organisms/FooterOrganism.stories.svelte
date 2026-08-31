<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews'
	import FooterOrganism from './FooterOrganism.svelte'
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: '03 Organisms / Footer Organism',
		component: FooterOrganism,
		tags: ['autodocs', 'organism'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url,
		} satisfies StoryParameters,
	})
</script>

<Story name="Primary" args={{}}>
	<p>03 Organisms / Footer Organism</p>
</Story>
