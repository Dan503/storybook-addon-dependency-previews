import type { Meta } from '@storybook/react-vite'
import { useForm } from '@tanstack/react-form'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { FormDataMolecule } from '../FormDataPreview/FormDataMolecule'
import { useFormValues } from '../formUtils'
import {
	TextFieldMolecule,
	type PropsForTextFieldMolecule,
} from './TextFieldMolecule'

// Button.stories.tsx
const meta: Meta<typeof TextFieldMolecule> = {
	title: 'Forms/Text Field Molecule',
	component: TextFieldMolecule,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'centered',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
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
