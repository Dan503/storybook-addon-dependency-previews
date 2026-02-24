<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import ErrorListMolecule, { type PropsForErrorListMolecule } from './ErrorListMolecule.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Forms / Error Messages / Error List Molecule',
		component: ErrorListMolecule,
		tags: ['autodocs', 'molecule'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});
	type Args = Omit<PropsForErrorListMolecule, 'children'>;

	const errorStrings = ['Error One', 'Second error'];
	const errorObjects = errorStrings.map((err) => new Error(err));
</script>

<Story name="Error Strings" args={{ errors: errorStrings } satisfies Args} />

<Story name="Error Objects" args={{ errors: errorObjects } satisfies Args} />
