<script lang="ts">
	import TextFieldMolecule, { type PropsForTextFieldMolecule } from './TextFieldMolecule.svelte';
	import FormDataMolecule from '../../zz-meta-components/FormDataPreview/FormDataMolecule.svelte';
	import { createForm, Form, Field, type ValidationMode } from '@formisch/svelte';
	import { defaultFirstNameOnlyValues, firstNameOnlySchema } from 'example-site-shared/data';

	interface DecoratorProps extends Omit<PropsForTextFieldMolecule, 'field'> {
		validate?: ValidationMode;
	}

	const { label, placeholder, validate }: DecoratorProps = $props();

	const form = $derived(
		createForm({
			schema: firstNameOnlySchema,
			initialInput: defaultFirstNameOnlyValues,
			validate
		})
	);
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
