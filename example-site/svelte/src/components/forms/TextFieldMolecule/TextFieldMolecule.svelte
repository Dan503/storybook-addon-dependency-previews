<script lang="ts">
	import { useStore, type AnyFieldApi } from '@tanstack/svelte-form';
	import type { WithField } from '../FormTypes';
	import ErrorListMolecule from '../ErrorMessages/ErrorListMolecule.svelte';

	export interface PropsForTextFieldMolecule {
		label: string;
		placeholder?: string;
	}

	export type FieldPropsForTextFieldMolecule<FieldApi extends AnyFieldApi> =
		PropsForTextFieldMolecule & WithField<FieldApi>;

	const { label, placeholder, field }: FieldPropsForTextFieldMolecule<AnyFieldApi> = $props();

	const errors = $derived(useStore(field.store, (s) => s.meta.errors));
	const id = $derived(field.name.replace(/\W/g, ''));
	const showErrors = $derived(field.state.meta.isTouched && errors.current?.length > 0);
</script>

<div class="TextFieldMolecule">
	<label for={id} class="mb-1 grid gap-2">
		<span class="text-xl font-bold">
			{label}
		</span>
		<input
			{id}
			value={field.state.value}
			{placeholder}
			onblur={field.handleBlur}
			oninput={(e) => field.handleChange(e.currentTarget.value)}
			class={`w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${showErrors ? 'placeholder-red-900/60' : ''}`}
			class:border-red-600={showErrors}
			class:text-red-900={showErrors}
		/>
	</label>
	{#if showErrors}
		<ErrorListMolecule errors={errors.current} />
	{/if}
</div>
