<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import FormDataPreviewAtom from './FormDataPreviewAtom.svelte';
	import type { WithForm } from '../../forms/FormTypes';
	import type { Schema } from '@formisch/svelte';

	export interface PropsForFormDataMolecule<TSchema extends Schema> extends WithForm<TSchema> {
		children?: Snippet;
	}
</script>

<script lang="ts" generics="TSchema extends Schema">
	const { children, form }: PropsForFormDataMolecule<TSchema> = $props();
</script>

<div class="FormDataMolecule grid grid-cols-[minmax(0,1fr)] gap-2">
	{@render children?.()}
	<FormDataPreviewAtom {form} />
</div>
