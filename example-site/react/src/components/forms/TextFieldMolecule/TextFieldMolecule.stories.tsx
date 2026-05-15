import { Field, useForm } from '@formisch/react'
import { FormDataMolecule } from '../FormDataPreview/FormDataMolecule'
import { TextFieldMolecule } from './TextFieldMolecule'
import type { PropsForTextFieldMolecule } from './TextFieldMolecule'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import type { Meta } from '@storybook/react-vite'
import {
	defaultFirstNameOnlyValues,
	firstNameOnlySchema,
} from 'example-site-shared/data'

// Button.stories.tsx
const meta: Meta<typeof TextFieldMolecule> = {
	title: 'Forms/Text Field Molecule',
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
		const form = useForm({
			schema: firstNameOnlySchema,
			initialInput: defaultFirstNameOnlyValues,
		})

		return (
			<FormDataMolecule form={form}>
				<Field of={form} path={['firstName']}>
					{(field) => <TextFieldMolecule {...args} field={field} form={form} />}
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
		const form = useForm({
			schema: firstNameOnlySchema,
			initialInput: defaultFirstNameOnlyValues,
			validate: 'initial',
		})

		return (
			<FormDataMolecule form={form}>
				<Field of={form} path={['firstName']}>
					{(field) => {
						return <TextFieldMolecule {...args} form={form} field={field} />
					}}
				</Field>
			</FormDataMolecule>
		)
	},
}
