<script lang="ts">
	import type { WithField } from '../FormTypes';
	import { useStore, type AnyFieldApi } from '@tanstack/svelte-form';
	import ErrorListMolecule from '../ErrorMessages/ErrorListMolecule.svelte';

	export interface PropsForTextAreaMolecule {
		label: string;
		placeholder?: string;
	}
	export type FieldPropsForTextAreaMolecule<FieldApi extends AnyFieldApi> =
		PropsForTextAreaMolecule & WithField<FieldApi>;

	const { label, placeholder, field }: FieldPropsForTextAreaMolecule<AnyFieldApi> = $props();

	const errors = $derived(useStore(field.store, (s) => s.meta.errors));
	const id = $derived(field.name.replace(/\W/g, ''));
	const showErrors = $derived(field.state.meta.isTouched && errors.current?.length > 0);
</script>

<div class="TextAreaMolecule">
	<label for={id} class="mb-1 block text-xl font-bold">
		{label}
		<!-- Need to use minmax(0,1fr) to prevent the textarea forcing the grid column to expand -->
		<div class="grid grid-cols-[minmax(0,1fr)]">
			<textarea
				{id}
				value={field.state.value}
				{placeholder}
				onblur={field.handleBlur}
				oninput={(e) => field.handleChange(e.currentTarget.value)}
				class="col-start-1 row-start-1 min-w-0 resize-none overflow-hidden rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
			></textarea>
			<span
				class="pointer-events-none col-start-1 row-start-1 min-w-0 overflow-hidden px-4 py-2 wrap-break-word whitespace-pre-wrap"
			>
				{field.state.value}
			</span>
		</div>
	</label>
	{#if showErrors}
		<ErrorListMolecule errors={errors.current} />
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
