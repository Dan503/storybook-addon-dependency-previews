<script lang="ts" module>
	import type { WithField } from '../FormTypes';
	import ErrorListMolecule from '../ErrorMessages/ErrorListMolecule.svelte';
	import type { RequiredPath, Schema } from '@formisch/svelte';

	export interface PropsForTextFieldMolecule {
		label: string;
		placeholder?: string;
	}

	export type FieldPropsForTextFieldMolecule<
		TSchema extends Schema,
		TPath extends RequiredPath
	> = PropsForTextFieldMolecule & WithField<TSchema, TPath>;
</script>

<script lang="ts" generics="TSchema extends Schema, TPath extends RequiredPath">
	const { label, placeholder, field }: FieldPropsForTextFieldMolecule<TSchema, TPath> = $props();

	const id = $derived(field.path.join('-').replace(/\W/g, ''));
	const showErrors = $derived((field.errors?.length ?? 0) > 0);
</script>

<div class="TextFieldMolecule">
	<label for={id} class="mb-1 grid gap-2">
		<span class="text-xl font-bold">
			{label}
		</span>
		<input
			{...field.props}
			{id}
			value={field.input as string | undefined}
			{placeholder}
			class={`w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${showErrors ? 'placeholder-red-900/60' : ''}`}
			class:border-red-600={showErrors}
			class:text-red-900={showErrors}
		/>
	</label>
	{#if showErrors}
		<ErrorListMolecule errors={field.errors} />
	{/if}
</div>
