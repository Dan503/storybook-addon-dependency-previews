<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import FormDataMolecule, { type PropsForFormDataMolecule } from './FormDataMolecule.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ChildContentAtom from '../ChildContentAtom.svelte';
	import {
		contactFormSchema,
		exampleContactFormValues,
		type ContactFormSchemaType
	} from 'example-site-shared/data';
	import { createForm } from '@formisch/svelte';

	const { Story } = defineMeta({
		title: 'ZZ Meta Components / Form Data Preview / Form Data Molecule',
		component: FormDataMolecule,
		tags: ['autodocs', 'molecule'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});
	type Args = Omit<PropsForFormDataMolecule<ContactFormSchemaType>, 'children'>;
	const form = createForm({
		schema: contactFormSchema,
		initialInput: exampleContactFormValues
	});
</script>

<Story name="Primary" args={{ form } satisfies Args}>
	<ChildContentAtom />
</Story>
