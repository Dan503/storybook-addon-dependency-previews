<script setup lang="ts">
import type { ValidationMode } from '@formisch/vue'
import FormDataMolecule from '../../zz-meta-components/FormDataPreview/FormDataMolecule.vue'
import ContactFormOrganism from './ContactFormOrganism.vue'
import { onContactFormSubmit, useContactForm } from './useContactForm'

interface DecoratorProps {
	validate?: ValidationMode
}

const { validate } = defineProps<DecoratorProps>()

const form = useContactForm(validate)
</script>

<template>
	<FormDataMolecule :form="form">
		<ContactFormOrganism :form="form" :on-submit="onContactFormSubmit" />
	</FormDataMolecule>
</template>
