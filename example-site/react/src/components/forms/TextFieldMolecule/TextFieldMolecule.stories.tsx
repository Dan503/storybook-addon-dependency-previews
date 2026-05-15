import { Field, useForm } from '@formisch/react'
import * as v from 'valibot'
import { FormDataMolecule } from '../FormDataPreview/FormDataMolecule'
import { TextFieldMolecule } from './TextFieldMolecule'
import type { PropsForTextFieldMolecule } from './TextFieldMolecule'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import type { Meta } from '@storybook/react-vite'

const schema = v.object({
	firstName: v.pipe(v.string(), v.nonEmpty('First name is required')),
})

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

type InputStructure = v.InferInput<typeof schema>

const initialInput: InputStructure = {
	firstName: '',
}

export const Default = {
	args: {
		label: 'First name',
		placeholder: 'Placeholder text',
	} satisfies PropsForTextFieldMolecule,
	render: (args: PropsForTextFieldMolecule) => {
		const form = useForm({
			schema,
			initialInput,
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
			schema,
			validate: 'initial',
			initialInput,
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
