<script lang="ts">
	import { type ValidationMode } from '@formisch/svelte';
	import FormDataMolecule from '../../zz-meta-components/FormDataPreview/FormDataMolecule.svelte';
	import ContactFormOrganism from './ContactFormOrganism.svelte';
	import { createContactForm, onContactFormSubmit } from './createContactForm';

	interface DecoratorProps {
		validate?: ValidationMode;
	}

	const { validate }: DecoratorProps = $props();

	const form = $derived(createContactForm(validate));
</script>

<FormDataMolecule {form}>
	<ContactFormOrganism {form} onSubmit={onContactFormSubmit} />
</FormDataMolecule>
