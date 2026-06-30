<script setup lang="ts">
import type { FormErrors } from '../FormTypes'
import ErrorMessageAtom from './ErrorMessageAtom.vue'

export interface PropsForErrorListMolecule {
	errors: FormErrors
}

const { errors } = defineProps<PropsForErrorListMolecule>()
</script>

<template>
	<ul
		v-if="errors && errors.length > 0"
		class="ErrorListMolecule grid gap-1 pl-6"
	>
		<li
			v-for="err in errors"
			:key="err instanceof Error ? err.message : err"
			class="list-outside list-disc"
		>
			<ErrorMessageAtom :error="err" />
		</li>
	</ul>
</template>
