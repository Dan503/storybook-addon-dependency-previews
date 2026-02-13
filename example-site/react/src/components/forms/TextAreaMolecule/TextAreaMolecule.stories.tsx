import { useEffect } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useForm, type AnyFieldApi } from '@tanstack/react-form'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { FormDataMolecule } from '../FormDataPreview/FormDataMolecule'
import { useFormValues } from '../formUtils'
import {
	TextAreaMolecule,
	type PropsForTextAreaMolecule,
} from './TextAreaMolecule'

function useTriggerErrors(field: AnyFieldApi) {
	useEffect(() => {
		field.handleChange(field.state.value)
		field.handleBlur()
	}, [field])
}

const meta: Meta<typeof TextAreaMolecule> = {
	title: 'Forms / Text Area Molecule',
	component: TextAreaMolecule,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		label: 'Your message',
		placeholder: 'Type your message here...',
	} satisfies PropsForTextAreaMolecule,
	render: (args) => {
		const form = useForm({
			defaultValues: {
				message: '',
			},
		})
		const formValues = useFormValues(form)

		return (
			<FormDataMolecule formValues={formValues}>
				<form.Field name="message">
					{(field) => <TextAreaMolecule {...args} field={field} />}
				</form.Field>
			</FormDataMolecule>
		)
	},
}

export const ErrorState: Story = {
	args: {
		label: 'Your message',
		placeholder: 'Type your message here...',
	} satisfies PropsForTextAreaMolecule,
	render: (args) => {
		const form = useForm({
			defaultValues: {
				message: '',
			},
		})
		const formValues = useFormValues(form)

		return (
			<FormDataMolecule formValues={formValues}>
				<form.Field
					name="message"
					validators={{
						onChange: ({ value }) =>
							!value
								? 'Message is required'
								: value.length < 10
									? 'Message must be at least 10 characters'
									: undefined,
					}}
				>
					{(field) => {
						useTriggerErrors(field)
						return <TextAreaMolecule {...args} field={field} />
					}}
				</form.Field>
			</FormDataMolecule>
		)
	},
}
