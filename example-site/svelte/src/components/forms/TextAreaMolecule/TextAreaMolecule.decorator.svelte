<script lang="ts">
	import TextAreaMolecule, { type PropsForTextAreaMolecule } from './TextAreaMolecule.svelte';
	import FormDataMolecule from '../../zz-meta-components/FormDataPreview/FormDataMolecule.svelte';
	import { createForm, Form, Field, type ValidationMode } from '@formisch/svelte';
	import { defaultMessageOnlyValues, messageOnlySchema } from 'example-site-shared/data';

	interface DecoratorProps extends Omit<PropsForTextAreaMolecule, 'field'> {
		validate?: ValidationMode;
	}

	const { label, placeholder, validate }: DecoratorProps = $props();

	const form = $derived(
		createForm({
			schema: messageOnlySchema,
			initialInput: defaultMessageOnlyValues,
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
	<Field of={form} path={['message']}>
		{#snippet children(field)}
			<FormDataMolecule {form}>
				<TextAreaMolecule {label} {placeholder} {field} />
			</FormDataMolecule>
		{/snippet}
	</Field>
</Form>
