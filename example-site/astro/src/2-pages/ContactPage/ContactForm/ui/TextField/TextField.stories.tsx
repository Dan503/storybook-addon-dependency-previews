import { Field, useForm, type ValidationMode } from '@formisch/react'
import type { Meta } from '@storybook/react'
import {
	defaultFirstNameOnlyValues,
	firstNameOnlySchema,
} from 'example-site-shared/data'
import { FormFieldWithDataPreview } from '../../storybook-only/FormFieldWithDataPreview/FormFieldWithDataPreview'
import { TextField, type PropsForTextField } from './TextField'

const meta: Meta<typeof TextField> = {
	component: TextField,
	parameters: {
		layout: 'padded',
		renderer: 'react',
	},
}

export default meta

interface PropsForTextFieldWithForm extends PropsForTextField {
	validate?: ValidationMode
}

function TextFieldWithForm({ validate, ...props }: PropsForTextFieldWithForm) {
	const form = useForm({
		schema: firstNameOnlySchema,
		initialInput: defaultFirstNameOnlyValues,
		validate,
	})

	return (
		<FormFieldWithDataPreview form={form}>
			<Field of={form} path={['firstName']}>
				{(field) => <TextField {...props} field={field} />}
			</Field>
		</FormFieldWithDataPreview>
	)
}

const args = {
	label: 'First name',
	placeholder: 'Placeholder text',
} satisfies PropsForTextField

export const Default = {
	args,
	render: (storyArgs: PropsForTextField) => (
		<TextFieldWithForm {...storyArgs} />
	),
}

export const ErrorState = {
	args,
	render: (storyArgs: PropsForTextField) => (
		<TextFieldWithForm {...storyArgs} validate="initial" />
	),
}
