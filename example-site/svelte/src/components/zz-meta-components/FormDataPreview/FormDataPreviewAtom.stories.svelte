<script lang="ts" module>
	import type { StoryParameters } from 'storybook-addon-dependency-previews';
	import FormDataPreviewAtom, {
		type PropsForFormDataPreviewAtom
	} from './FormDataPreviewAtom.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'ZZ Meta Components / Form Data Preview / Form Data Preview Atom',
		component: FormDataPreviewAtom,
		tags: ['autodocs', 'atom'],
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

	type Args = Omit<PropsForFormDataPreviewAtom, 'children'>;
</script>

<Story name="Primary" args={{ formValues: sampleFormValues } satisfies Args} />
