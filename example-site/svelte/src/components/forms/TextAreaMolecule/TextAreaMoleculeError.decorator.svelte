<script lang="ts">
	import { createForm, useStore } from '@tanstack/svelte-form';
	import { untrack } from 'svelte';
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

	$effect(() => {
		untrack(() => {
			form.setFieldMeta('message', (prev) => ({ ...prev, isTouched: true }));
			form.validateField('message', 'change');
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
		name="message"
		validators={{
			onChange: ({ value }) => {
				if (!value) {
					return 'Message is required';
				} else if (value.length < 10) {
					return 'Message must be at least 10 characters';
				}
			}
		}}
	>
		{#snippet children(field)}
			<FormDataMolecule formValues={formValues.current}>
				<TextAreaMolecule {label} {placeholder} {field} />
			</FormDataMolecule>
		{/snippet}
	</form.Field>
</form>
