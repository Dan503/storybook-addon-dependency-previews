<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews'
	import FooterOrganism, { type PropsForFooterOrganism } from './FooterOrganism.svelte'
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
	type Args = Omit<PropsForFooterOrganism, 'children'>;
</script>

<Story name="Primary" args={{} satisfies Args}>
	<p>03 Organisms / Footer Organism</p>
</Story>
