<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import ErrorMessageAtom, { type PropsForErrorMessageAtom } from './ErrorMessageAtom.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Forms / Error Messages / Error Message Atom',
		component: ErrorMessageAtom,
		tags: ['autodocs', 'atom'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});
	type Args = Omit<PropsForErrorMessageAtom, 'children'>;
</script>

<Story name="Error string" args={{ error: 'This is an error message as a string' } satisfies Args}>
	<p>Forms / Error Messages / Error Message Atom</p>
</Story>

<Story
	name="Error object"
	args={{ error: new Error('This is an error message as an Error() object') } satisfies Args}
>
	<p>Forms / Error Messages / Error Message Atom</p>
</Story>
