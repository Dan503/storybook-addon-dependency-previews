<script lang="ts">
	import { createForm, useStore } from '@tanstack/svelte-form';
	import TextAreaMolecule, { type PropsForTextAreaMolecule } from './TextAreaMolecule.svelte';
	import FormDataMolecule from '../../zz-meta-components/FormDataPreview/FormDataMolecule.svelte';

	const { label, placeholder }: PropsForTextAreaMolecule = $props();

	const form = createForm(() => ({
		defaultValues: {
			message: ''
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
	<form.Field name="message">
		{#snippet children(field)}
			<FormDataMolecule formValues={formValues.current}>
				<TextAreaMolecule {label} {placeholder} {field} />
			</FormDataMolecule>
		{/snippet}
	</form.Field>
</form>
