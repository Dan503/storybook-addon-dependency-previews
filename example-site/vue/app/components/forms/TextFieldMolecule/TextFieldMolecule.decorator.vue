<script setup lang="ts">
import { Field, Form, useForm, type ValidationMode } from '@formisch/vue'
import {
	defaultFirstNameOnlyValues,
	firstNameOnlySchema,
	type FirstNameOnlyOutputData,
} from 'example-site-shared/data'
import FormDataMolecule from '../../zz-meta-components/FormDataPreview/FormDataMolecule.vue'
import TextFieldMolecule, {
	type PropsForTextFieldMolecule,
} from './TextFieldMolecule.vue'

interface DecoratorProps extends Omit<PropsForTextFieldMolecule, 'field'> {
	validate?: ValidationMode
}

const { label, placeholder, validate } = defineProps<DecoratorProps>()

const form = useForm({
	schema: firstNameOnlySchema,
	initialInput: defaultFirstNameOnlyValues,
	validate,
})

function onSubmit(output: FirstNameOnlyOutputData) {
	alert(JSON.stringify(output, null, 2))
}
</script>

<template>
	<Form id="form" :of="form" @submit="onSubmit">
		<Field :of="form" :path="['firstName']" v-slot="field">
			<FormDataMolecule :form="form">
				<TextFieldMolecule
					:label="label"
					:placeholder="placeholder"
					:field="field"
				/>
			</FormDataMolecule>
		</Field>
	</Form>
</template>
