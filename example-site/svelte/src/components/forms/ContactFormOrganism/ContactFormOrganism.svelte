<script lang="ts">
	import { createForm, Form, Field } from '@formisch/svelte';
	import {
		defaultContactFormValues,
		contactFormSchema,
		type ContactFormOutputData
	} from 'example-site-shared/data';
	import TextAreaMolecule from '../TextAreaMolecule/TextAreaMolecule.svelte';
	import ButtonAtom from '../../01-atoms/ButtonAtom.svelte';
	import TextFieldMolecule from '../TextFieldMolecule/TextFieldMolecule.svelte';

	export interface PropsForContactFormOrganism {
		onSubmit?: (output: ContactFormOutputData) => void;
	}

	let { onSubmit }: PropsForContactFormOrganism = $props();

	const form = createForm({
		schema: contactFormSchema,
		initialInput: defaultContactFormValues
	});
</script>

<Form
	of={form}
	id="form"
	class="grid gap-4"
	onsubmit={(output, e) => {
		e.preventDefault();
		onSubmit?.(output);
	}}
>
	<Field of={form} path={['name']}>
		{#snippet children(field)}
			<TextFieldMolecule label="Name" placeholder="Your name" {field} />
		{/snippet}
	</Field>

	<Field of={form} path={['email']}>
		{#snippet children(field)}
			<TextFieldMolecule label="Email" placeholder="example@email.com" {field} />
		{/snippet}
	</Field>

	<Field of={form} path={['message']}>
		{#snippet children(field)}
			<TextAreaMolecule label="Message" placeholder="Type your message here..." {field} />
		{/snippet}
	</Field>

	<div class="flex justify-end">
		<ButtonAtom type="submit">Send</ButtonAtom>
	</div>
</Form>
