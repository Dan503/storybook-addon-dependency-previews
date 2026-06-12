<script setup lang="ts">
import { Field, Form, useForm, type ValidationMode } from '@formisch/vue'
import {
	defaultMessageOnlyValues,
	messageOnlySchema,
	type MessageOnlyOutputData,
} from 'example-site-shared/data'
import FormDataMolecule from '../../zz-meta-components/FormDataPreview/FormDataMolecule.vue'
import TextAreaMolecule, {
	type PropsForTextAreaMolecule,
} from './TextAreaMolecule.vue'

interface DecoratorProps extends Omit<PropsForTextAreaMolecule, 'field'> {
	validate?: ValidationMode
}

const { label, placeholder, validate } = defineProps<DecoratorProps>()

const form = useForm({
	schema: messageOnlySchema,
	initialInput: defaultMessageOnlyValues,
	validate,
})

function onSubmit(output: MessageOnlyOutputData) {
	alert(JSON.stringify(output, null, 2))
}
</script>

<template>
	<Form id="form" :of="form" @submit="onSubmit">
		<Field :of="form" :path="['message']" v-slot="field">
			<FormDataMolecule :form="form">
				<TextAreaMolecule
					:label="label"
					:placeholder="placeholder"
					:field="field"
				/>
			</FormDataMolecule>
		</Field>
	</Form>
</template>
