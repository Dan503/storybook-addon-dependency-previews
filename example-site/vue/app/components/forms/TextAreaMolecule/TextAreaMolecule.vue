<script
	setup
	lang="ts"
	generic="TSchema extends Schema, TPath extends RequiredPath"
>
import { computed } from 'vue'
import type { RequiredPath, Schema } from '@formisch/vue'
import type { WithField } from '../FormTypes'
import ErrorListMolecule from '../ErrorMessages/ErrorListMolecule.vue'

export interface PropsForTextAreaMolecule {
	label: string
	placeholder?: string
}

export type FieldPropsForTextAreaMolecule<
	TSchema extends Schema,
	TPath extends RequiredPath,
> = PropsForTextAreaMolecule & WithField<TSchema, TPath>

const { label, placeholder, field } =
	defineProps<FieldPropsForTextAreaMolecule<TSchema, TPath>>()

const id = computed(() => field.path.join('-').replace(/\W/g, ''))
const showErrors = computed(() => (field.errors?.length ?? 0) > 0)
</script>

<template>
	<div class="TextAreaMolecule">
		<label :for="id" class="mb-1 grid gap-2">
			<span class="text-xl font-bold">
				{{ label }}
			</span>
			<!-- Need to use minmax(0,1fr) to prevent the textarea forcing the grid column to expand -->
			<div class="grid grid-cols-[minmax(0,1fr)]">
				<textarea
					v-bind="field.props"
					:id="id"
					v-model="field.input as string | undefined"
					:placeholder="placeholder"
					:class="[
						'col-start-1 row-start-1 min-w-0 resize-none overflow-hidden rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none',
						showErrors && 'border-red-600 text-red-900 placeholder-red-900/60',
					]"
				></textarea>
				<span
					class="pointer-events-none invisible col-start-1 row-start-1 min-w-0 overflow-hidden px-4 py-2 wrap-break-word whitespace-pre-wrap"
					>{{ field.input || placeholder || ' ' }}</span
				>
			</div>
		</label>
		<ErrorListMolecule v-if="showErrors" :errors="field.errors" />
	</div>
</template>

<style scoped>
.TextAreaMolecule textarea,
.TextAreaMolecule textarea + span {
	font-size: inherit;
	font-weight: inherit;
	line-height: inherit;
}

.TextAreaMolecule textarea + span::after {
	/* This ensures that when a new line is added, the span grows accordingly */
	content: ' ';
}
</style>
