<script lang="ts" module>
	import { type ValidationMode } from '@formisch/svelte';
	import FormDataMolecule from '../../zz-meta-components/FormDataPreview/FormDataMolecule.svelte';
	import ContactFormOrganism from './ContactFormOrganism.svelte';
	import { createContactForm, onContactFormSubmit } from './createContactForm';

	export interface PropsForContactFormOrganismStoryHarness {
		validate?: ValidationMode;
	}
</script>

<script lang="ts">
	const { validate }: PropsForContactFormOrganismStoryHarness = $props();

	const form = $derived(createContactForm(validate));
</script>

<FormDataMolecule {form}>
	<ContactFormOrganism {form} onSubmit={onContactFormSubmit} />
</FormDataMolecule>
