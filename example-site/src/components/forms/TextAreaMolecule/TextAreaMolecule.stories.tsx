import type { Meta, StoryObj } from '@storybook/react-vite'
import {
	TextAreaMolecule,
	type PropsForTextAreaMolecule,
} from './TextAreaMolecule'
import { useForm } from '@tanstack/react-form'
import { FormDataMolecule } from '../FormDataPreview/FormDataMolecule'
import { useFormValues } from '../formUtils'

const meta: Meta<typeof TextAreaMolecule> = {
	title: 'Forms / Text Area Molecule',
	component: TextAreaMolecule,
	tags: ['autodocs', 'molecule'],
	parameters: {
		__filePath: import.meta.url,
	},
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
