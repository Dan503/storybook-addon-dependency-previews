<script lang="ts">
	import TextFieldMolecule, { type PropsForTextFieldMolecule } from './TextFieldMolecule.svelte';
	import FormDataMolecule from '../../zz-meta-components/FormDataPreview/FormDataMolecule.svelte';
	import { createForm, Form, Field } from '@formisch/svelte';
	import { defaultFirstNameOnlyValues, firstNameOnlySchema } from 'example-site-shared/data';

	const { label, placeholder }: PropsForTextFieldMolecule = $props();

	const form = createForm({
		schema: firstNameOnlySchema,
		initialInput: defaultFirstNameOnlyValues,
		validate: 'initial'
	});
</script>

<Form
	of={form}
	id="form"
	onsubmit={(outputData, e) => {
		e.preventDefault();
		alert(JSON.stringify(outputData, null, 2));
	}}
>
	<Field of={form} path={['firstName']}>
		{#snippet children(field)}
			<FormDataMolecule {form}>
				<TextFieldMolecule {label} {placeholder} {field} />
			</FormDataMolecule>
		{/snippet}
	</Field>
</Form>
