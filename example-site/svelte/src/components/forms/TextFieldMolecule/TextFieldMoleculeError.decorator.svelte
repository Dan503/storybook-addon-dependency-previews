<script lang="ts">
	import { createForm, useStore } from '@tanstack/svelte-form';
	import { untrack } from 'svelte';
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

	$effect(() => {
		untrack(() => {
			form.setFieldMeta('firstName', (prev) => ({ ...prev, isTouched: true }));
			form.validateField('firstName', 'change');
		});
	});
</script>

<form
	id="form"
	onsubmit={(e) => {
		e.preventDefault();
		form.handleSubmit();
	}}
>
	<form.Field
		name="firstName"
		validators={{
			onChange: ({ value }) => {
				if (!value) {
					return 'First name is required';
				} else if (value.length < 3) {
					return 'First name must be at least 3 characters';
				}
			}
		}}
	>
		{#snippet children(field)}
			<FormDataMolecule formValues={formValues.current}>
				<TextFieldMolecule {label} {placeholder} {field} />
			</FormDataMolecule>
		{/snippet}
	</form.Field>
</form>
