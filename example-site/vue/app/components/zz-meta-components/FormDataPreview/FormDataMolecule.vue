<script setup lang="ts" generic="TSchema extends Schema">
import type { Schema } from '@formisch/vue'
import type { WithForm } from '../../forms/FormTypes'
import FormDataPreviewAtom from './FormDataPreviewAtom.vue'

export type PropsForFormDataMolecule<TSchema extends Schema> = WithForm<TSchema>

const { form } = defineProps<PropsForFormDataMolecule<TSchema>>()
</script>

<template>
	<div class="FormDataMolecule grid grid-cols-[minmax(0,1fr)] gap-2">
		<slot />
		<FormDataPreviewAtom :form="form" />
	</div>
</template>
