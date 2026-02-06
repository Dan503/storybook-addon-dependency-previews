<script lang="ts">
	import type { Snippet } from 'svelte';
	import FormDataPreviewAtom from './FormDataPreviewAtom.svelte';

	export interface PropsForFormDataMolecule<FormValues extends Record<string, any>> {
		formValues?: FormValues;
		children?: Snippet;
	}

	const { children, formValues }: PropsForFormDataMolecule<Record<string, any>> = $props();
</script>

<div class="FormDataMolecule grid gap-2">
	{@render children?.()}
	<FormDataPreviewAtom {formValues} />
</div>
