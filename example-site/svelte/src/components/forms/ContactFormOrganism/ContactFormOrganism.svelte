<script lang="ts">
	import { createForm, revalidateLogic, useStore } from '@tanstack/svelte-form';
	import {
		defaultContactFormValues,
		contactFormValuesSchema,
		type ContactFormValues
	} from 'example-site-shared/data';
	import TextAreaMolecule from '../TextAreaMolecule/TextAreaMolecule.svelte';
	import ButtonAtom from '../../01-atoms/ButtonAtom.svelte';
	import TextFieldMolecule from '../TextFieldMolecule/TextFieldMolecule.svelte';

	export interface PropsForContactFormOrganism {
		onSubmit?: () => void;
		formValues?: ContactFormValues;
	}

	let { onSubmit, formValues = $bindable(defaultContactFormValues) }: PropsForContactFormOrganism =
		$props();

	const form = createForm(() => ({
		defaultValues: defaultContactFormValues,
		onSubmit: onSubmit,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: contactFormValuesSchema
		}
	}));

	const values = useStore(form.store, (s) => s.values);

	$effect(() => {
		formValues = values.current;
	});
</script>

<form
	id="form"
	class="grid gap-4"
	onsubmit={(e) => {
		e.preventDefault();
		form.handleSubmit();
	}}
>
	<form.Field name="name">
		{#snippet children(field)}
			<TextFieldMolecule label="Name" placeholder="Your name" {field} />
		{/snippet}
	</form.Field>

	<form.Field name="email">
		{#snippet children(field)}
			<TextFieldMolecule label="Email" placeholder="example@email.com" {field} />
		{/snippet}
	</form.Field>

	<form.Field name="message">
		{#snippet children(field)}
			<TextAreaMolecule label="Message" placeholder="Type your message here..." {field} />
		{/snippet}
	</form.Field>

	<div class="flex justify-end">
		<ButtonAtom type="submit">Send</ButtonAtom>
	</div>
</form>
