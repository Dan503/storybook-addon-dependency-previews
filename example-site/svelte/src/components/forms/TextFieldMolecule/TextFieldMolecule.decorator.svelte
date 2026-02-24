<script lang="ts">
	import { createForm, useStore } from '@tanstack/svelte-form';
	import TextFieldMolecule, { type PropsForTextFieldMolecule } from './TextFieldMolecule.svelte';
	import FormDataMolecule from '../../zz-meta-components/FormDataPreview/FormDataMolecule.svelte';

	const { label, placeholder }: PropsForTextFieldMolecule = $props();

	const form = createForm(() => ({
		defaultValues: {
			firstName: ''
		},
		onSubmit: async ({ value }) => {
			alert(JSON.stringify(value, null, 2));
		}
	}));

	const formValues = $derived(useStore(form.store, (s) => s.values));
</script>

<form
	id="form"
	onsubmit={(e) => {
		e.preventDefault();
		form.handleSubmit();
	}}
>
	<form.Field name="firstName">
		{#snippet children(field)}
			<FormDataMolecule formValues={formValues.current}>
				<TextFieldMolecule {label} {placeholder} {field} />
			</FormDataMolecule>
		{/snippet}
	</form.Field>
</form>
