<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import FormDataMolecule, { type PropsForFormDataMolecule } from './FormDataMolecule.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ChildContentAtom from '../ChildContentAtom.svelte';

	const { Story } = defineMeta({
		title: 'ZZ Meta Components / Form Data Preview / Form Data Molecule',
		component: FormDataMolecule,
		tags: ['autodocs', 'molecule'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});
	const sampleFormValues = {
		firstName: 'John',
		lastName: 'Doe',
		email: 'john.doe@example.com'
	};
	type Args = Omit<PropsForFormDataMolecule<typeof sampleFormValues>, 'children'>;
</script>

<Story name="Primary" args={{ formValues: sampleFormValues } satisfies Args}>
	<ChildContentAtom />
</Story>
