<script lang="ts" module>
	import type { WithField } from '../FormTypes';
	import ErrorListMolecule from '../ErrorMessages/ErrorListMolecule.svelte';
	import type { Schema, RequiredPath } from '@formisch/svelte';

	export interface PropsForTextAreaMolecule {
		label: string;
		placeholder?: string;
	}
	export type FieldPropsForTextAreaMolecule<
		TSchema extends Schema,
		TPath extends RequiredPath
	> = PropsForTextAreaMolecule & WithField<TSchema, TPath>;
</script>

<script lang="ts" generics="TSchema extends Schema, TPath extends RequiredPath">
	const { label, placeholder, field }: FieldPropsForTextAreaMolecule<TSchema, TPath> = $props();

	const id = $derived(field.path.join('-').replace(/\W/g, ''));
	const showErrors = $derived((field.errors?.length ?? 0) > 0);
</script>

<div class="TextAreaMolecule">
	<label for={id} class="mb-1 grid gap-2">
		<span class="text-xl font-bold">
			{label}
		</span>
		<!-- Need to use minmax(0,1fr) to prevent the textarea forcing the grid column to expand -->
		<div class="grid grid-cols-[minmax(0,1fr)]">
			<textarea
				{...field.props}
				{id}
				value={field.input as string | undefined}
				{placeholder}
				class={`col-start-1 row-start-1 min-w-0 resize-none overflow-hidden rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${showErrors ? 'placeholder-red-900/60' : ''}`}
				class:border-red-600={showErrors}
				class:text-red-900={showErrors}
			></textarea>
			<span
				class="pointer-events-none invisible col-start-1 row-start-1 min-w-0 overflow-hidden px-4 py-2 wrap-break-word whitespace-pre-wrap"
			>
				{field.input || placeholder || ' '}
			</span>
		</div>
	</label>
	{#if showErrors}
		<ErrorListMolecule errors={field.errors} />
	{/if}
</div>

<style>
	.TextAreaMolecule {
		textarea,
		textarea + span {
			font-size: inherit;
			font-weight: inherit;
			line-height: inherit;
		}

		textarea + span::after {
			/* This ensures that when a new line is added, the span grows accordingly */
			content: ' ';
		}
	}
</style>
