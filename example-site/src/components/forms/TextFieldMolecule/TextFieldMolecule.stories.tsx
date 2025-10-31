import type { Meta } from '@storybook/react-vite'
import { useForm } from '@tanstack/react-form'
import { FormDataMolecule } from '../FormDataPreview/FormDataMolecule'
import {
	TextFieldMolecule,
	type PropsForTextFieldMolecule,
} from './TextFieldMolecule'
import { useFormValues } from '../formUtils'

// Button.stories.tsx
const meta: Meta<typeof TextFieldMolecule> = {
	title: 'Forms/Text Field Molecule',
	component: TextFieldMolecule,
	tags: ['autodocs', 'molecule'],
	parameters: {
		__filePath: import.meta.url,
	},
}

export default meta

export const Default = {
	args: {
		label: 'First name',
		placeholder: 'Placeholder text',
	} satisfies PropsForTextFieldMolecule,
	render: (args: PropsForTextFieldMolecule) => {
		const form = useForm({
			defaultValues: {
				firstName: '',
			},
		})
		const formValues = useFormValues(form)

		return (
			<FormDataMolecule formValues={formValues}>
				<form.Field name="firstName">
					{(field) => <TextFieldMolecule {...args} field={field} />}
				</form.Field>
			</FormDataMolecule>
		)
	},
}
