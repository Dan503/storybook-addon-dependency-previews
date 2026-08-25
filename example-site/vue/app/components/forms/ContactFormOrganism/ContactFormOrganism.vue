<script setup lang="ts">
import { computed } from 'vue'
import { Field, Form, getAllErrors, type FormStore } from '@formisch/vue'
import type {
	ContactFormOutputData,
	ContactFormSchemaType,
} from 'example-site-shared/data'
import ButtonAtom from '../../01-atoms/ButtonAtom.vue'
import TextFieldMolecule from '../TextFieldMolecule/TextFieldMolecule.vue'
import TextAreaMolecule from '../TextAreaMolecule/TextAreaMolecule.vue'
import ErrorBlockOrganism from '../ErrorMessages/ErrorBlockOrganism.vue'

export interface PropsForContactFormOrganism {
	form: FormStore<ContactFormSchemaType>
	onSubmit?: (output: ContactFormOutputData) => void
}

const { form, onSubmit } = defineProps<PropsForContactFormOrganism>()

const errors = computed(() => getAllErrors(form))
</script>

<template>
	<div class="grid gap-4">
		<ErrorBlockOrganism :errors="errors" />

		<Form
			id="form"
			class="grid gap-4"
			:of="form"
			@submit="(output) => onSubmit?.(output)"
		>
			<Field :of="form" :path="['name']" v-slot="field">
				<TextFieldMolecule
					label="Name"
					placeholder="Your name"
					:field="field"
				/>
			</Field>

			<Field :of="form" :path="['email']" v-slot="field">
				<TextFieldMolecule
					label="Email"
					placeholder="example@email.com"
					:field="field"
				/>
			</Field>

			<Field :of="form" :path="['message']" v-slot="field">
				<TextAreaMolecule
					label="Message"
					placeholder="Type your message here..."
					:field="field"
				/>
			</Field>

			<div class="flex justify-end">
				<ButtonAtom type="submit">Send</ButtonAtom>
			</div>
		</Form>
	</div>
</template>
