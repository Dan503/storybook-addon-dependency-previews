<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import FormDataPreviewAtom, {
		type PropsForFormDataPreviewAtom
	} from './FormDataPreviewAtom.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import {
		contactFormSchema,
		exampleContactFormValues,
		type ContactFormSchemaType
	} from 'example-site-shared/data';
	import { createForm } from '@formisch/svelte';

	const { Story } = defineMeta({
		title: 'ZZ Meta Components / Form Data Preview / Form Data Preview Atom',
		component: FormDataPreviewAtom,
		tags: ['autodocs', 'atom'],
		parameters: {
			layout: 'padded',
			__filePath: import.meta.url
		} satisfies StoryParameters
	});

	type Args = Omit<PropsForFormDataPreviewAtom<ContactFormSchemaType>, 'children'>;

	const form = createForm({
		schema: contactFormSchema,
		initialInput: exampleContactFormValues
	});
</script>

<Story name="Primary" args={{ form } satisfies Args} />
