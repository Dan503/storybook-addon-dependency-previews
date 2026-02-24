<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import StringOrSnippetAtom, {
		type PropsForStringOrSnippetAtom
	} from './StringOrSnippetAtom.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: '01 Atoms / String Or Snippet Atom',
		component: StringOrSnippetAtom,
		tags: ['autodocs', 'atom'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});
	type Args = Omit<PropsForStringOrSnippetAtom, 'children'>;
</script>

<Story name="String" args={{ value: 'This text is a basic string' } satisfies Args} />

<Story name="Snippet">
	{#snippet template()}
		<StringOrSnippetAtom>
			{#snippet value()}
				<p>This text is actually a <strong>snippet</strong>!</p>
			{/snippet}
		</StringOrSnippetAtom>
	{/snippet}
</Story>
