<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import ErrorListMolecule, { type PropsForErrorListMolecule } from './ErrorListMolecule.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { FormErrors } from '../FormTypes';

	const { Story } = defineMeta({
		title: 'Forms / Error Messages / Error List Molecule',
		component: ErrorListMolecule,
		tags: ['autodocs', 'molecule'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});

	const errorStrings: FormErrors = ['Error One', 'Second error'];
	const errorObjects: FormErrors = errorStrings.map((err) => new Error(err));
</script>

<Story name="Error Strings" args={{ errors: errorStrings } satisfies PropsForErrorListMolecule} />

<Story name="Error Objects" args={{ errors: errorObjects } satisfies PropsForErrorListMolecule} />
