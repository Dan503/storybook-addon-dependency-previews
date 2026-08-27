<script
	setup
	lang="ts"
	generic="TSchema extends Schema, TPath extends RequiredPath"
>
import { computed } from 'vue'
import type { RequiredPath, Schema } from '@formisch/vue'
import type { WithField } from '../FormTypes'
import ErrorListMolecule from '../ErrorMessages/ErrorListMolecule.vue'

export interface PropsForTextFieldMolecule {
	label: string
	placeholder?: string
}

export type FieldPropsForTextFieldMolecule<
	TSchema extends Schema,
	TPath extends RequiredPath,
> = PropsForTextFieldMolecule & WithField<TSchema, TPath>

const { label, placeholder, field } =
	defineProps<FieldPropsForTextFieldMolecule<TSchema, TPath>>()

const id = computed(() => field.path.join('-').replace(/\W/g, ''))
const showErrors = computed(() => (field.errors?.length ?? 0) > 0)
</script>

<template>
	<div class="TextFieldMolecule">
		<label :for="id" class="mb-1 grid gap-2">
			<span class="text-xl font-bold">
				{{ label }}
			</span>
			<input
				v-bind="field.props"
				:id="id"
				v-model="field.input as string | undefined"
				:placeholder="placeholder"
				:class="[
					'w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none',
					showErrors && 'border-red-600 text-red-900 placeholder-red-900/60',
				]"
			/>
		</label>
		<ErrorListMolecule v-if="showErrors" :errors="field.errors" />
	</div>
</template>
