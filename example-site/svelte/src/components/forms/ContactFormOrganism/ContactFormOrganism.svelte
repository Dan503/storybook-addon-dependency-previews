<script lang="ts">
	import { createForm, useStore } from '@tanstack/svelte-form';
	import { defaultContactFormValues, type ContactFormValues } from 'example-site-shared/data';
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
		onSubmit: onSubmit
	}));

	const values = useStore(form.store, (s) => s.values);

	$effect(() => {
		formValues = values.current;
	});
</script>

<form
	id="form"
	onsubmit={(e) => {
		e.preventDefault();
		form.handleSubmit();
	}}
	class="grid gap-4"
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
			<TextAreaMolecule label="Message" placeholder="Type your message here..." {field} />
		{/snippet}
	</form.Field>

	<div class="flex justify-end">
		<ButtonAtom type="submit">Send</ButtonAtom>
	</div>
</form>
