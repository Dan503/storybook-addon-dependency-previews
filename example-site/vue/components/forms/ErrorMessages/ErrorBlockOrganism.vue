<script setup lang="ts">
import type { FormErrors } from '../FormTypes'
import ErrorListMolecule from './ErrorListMolecule.vue'

export interface PropsForErrorBlockOrganism {
	errors: FormErrors
}

const { errors } = defineProps<PropsForErrorBlockOrganism>()
</script>

<template>
	<div
		v-if="errors && errors.length > 0"
		role="alert"
		class="ErrorBlockOrganism"
	>
		<div class="rounded-xl bg-red-100 px-4 pt-2">
			<h2 class="border-b-2 border-red-800 pb-1 text-2xl font-bold">
				Please resolve the following errors
			</h2>
			<div class="pt-3 pb-4">
				<ErrorListMolecule :errors="errors" />
			</div>
		</div>
	</div>
</template>
