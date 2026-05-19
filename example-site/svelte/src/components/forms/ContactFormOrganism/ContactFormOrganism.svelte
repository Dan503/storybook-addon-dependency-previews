<script lang="ts">
	import { Form, Field, type FormStore, getAllErrors } from '@formisch/svelte';
	import type { ContactFormOutputData, ContactFormSchemaType } from 'example-site-shared/data';
	import TextAreaMolecule from '../TextAreaMolecule/TextAreaMolecule.svelte';
	import ButtonAtom from '../../01-atoms/ButtonAtom.svelte';
	import TextFieldMolecule from '../TextFieldMolecule/TextFieldMolecule.svelte';
	import ErrorBlockOrganism from '../ErrorMessages/ErrorBlockOrganism.svelte';

	export interface PropsForContactFormOrganism {
		form: FormStore<ContactFormSchemaType>;
		onSubmit?: (output: ContactFormOutputData) => void;
	}

	let { form, onSubmit }: PropsForContactFormOrganism = $props();

	const errors = $derived(getAllErrors(form));
</script>

<div class="grid gap-4">
	<ErrorBlockOrganism {errors} />

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
</div>
