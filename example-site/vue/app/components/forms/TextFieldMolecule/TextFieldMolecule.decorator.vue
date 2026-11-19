<script setup lang="ts">
import { Field, Form, useForm, type ValidationMode } from '@formisch/vue'
import {
	defaultNameOnlyValues,
	nameOnlySchema,
	type NameOnlyOutputData,
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
	schema: nameOnlySchema,
	initialInput: defaultNameOnlyValues,
	validate,
})

function onSubmit(output: NameOnlyOutputData) {
	alert(JSON.stringify(output, null, 2))
}
</script>

<template>
	<Form id="form" :of="form" @submit="onSubmit">
		<Field :of="form" :path="['name']" v-slot="field">
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
