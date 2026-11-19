import { Field, createForm } from '@formisch/solid'
import { FormDataMolecule } from '../FormDataPreview/FormDataMolecule'
import { TextFieldMolecule } from './TextFieldMolecule'
import type { PropsForTextFieldMolecule } from './TextFieldMolecule'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import type { Meta } from 'storybook-solidjs-vite'
import { defaultNameOnlyValues, nameOnlySchema } from 'example-site-shared/data'

const meta: Meta<typeof TextFieldMolecule> = {
	title: 'Forms / Text Field Molecule',
	component: TextFieldMolecule,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
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
		const form = createForm({
			schema: nameOnlySchema,
			initialInput: defaultNameOnlyValues,
		})

		return (
			<FormDataMolecule form={form}>
				<Field of={form} path={['name']}>
					{(field) => <TextFieldMolecule {...args} field={field} />}
				</Field>
			</FormDataMolecule>
		)
	},
}

export const ErrorState = {
	args: {
		label: 'First name',
		placeholder: 'Placeholder text',
	} satisfies PropsForTextFieldMolecule,
	render: (args: PropsForTextFieldMolecule) => {
		const form = createForm({
			schema: nameOnlySchema,
			initialInput: defaultNameOnlyValues,
			validate: 'initial',
		})

		return (
			<FormDataMolecule form={form}>
				<Field of={form} path={['name']}>
					{(field) => <TextFieldMolecule {...args} field={field} />}
				</Field>
			</FormDataMolecule>
		)
	},
}
