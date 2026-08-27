<script setup lang="ts" generic="TSchema extends Schema">
import { computed } from 'vue'
import { getInput, type Schema } from '@formisch/vue'
import type { WithForm } from '../../forms/FormTypes'

export type PropsForFormDataPreviewAtom<TSchema extends Schema> =
	WithForm<TSchema>

const { form } = defineProps<PropsForFormDataPreviewAtom<TSchema>>()

const formValues = computed(() => getInput(form))
</script>

<template>
	<pre
		class="overflow-auto"
	><code>{{ JSON.stringify(formValues, null, 3) }}</code></pre>
</template>
