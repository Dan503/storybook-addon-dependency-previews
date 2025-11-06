import type { Meta, StoryObj } from '@storybook/react-vite'
import { useForm } from '@tanstack/react-form'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { FormDataMolecule } from '../FormDataPreview/FormDataMolecule'
import { useFormValues } from '../formUtils'
import {
	TextAreaMolecule,
	type PropsForTextAreaMolecule,
} from './TextAreaMolecule'

const meta: Meta<typeof TextAreaMolecule> = {
	title: 'Forms / Text Area Molecule',
	component: TextAreaMolecule,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'centered',
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
