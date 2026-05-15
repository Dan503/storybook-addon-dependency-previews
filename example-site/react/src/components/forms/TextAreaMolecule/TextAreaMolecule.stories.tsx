import * as v from 'valibot'
import { Field, useForm } from '@formisch/react'
import { FormDataMolecule } from '../FormDataPreview/FormDataMolecule'
import { TextAreaMolecule } from './TextAreaMolecule'
import type { PropsForTextAreaMolecule } from './TextAreaMolecule'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import type { Meta, StoryObj } from '@storybook/react-vite'

const schema = v.object({
	message: v.pipe(
		v.string(),
		v.nonEmpty('Message is required'),
		v.minLength(10, 'Message must be at least 10 characters'),
	),
})

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

type InputStructure = v.InferInput<typeof schema>

const initialInput: InputStructure = {
	message: '',
}

export const Primary: Story = {
	args: {
		label: 'Your message',
		placeholder: 'Type your message here...',
	} satisfies PropsForTextAreaMolecule,
	render: (args) => {
		const form = useForm({
			schema,
			initialInput,
		})

		return (
			<FormDataMolecule form={form}>
				<Field of={form} path={['message']}>
					{(field) => <TextAreaMolecule {...args} form={form} field={field} />}
				</Field>
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
			schema,
			initialInput,
			validate: 'initial',
		})

		return (
			<FormDataMolecule form={form}>
				<Field of={form} path={['message']}>
					{(field) => {
						return <TextAreaMolecule {...args} form={form} field={field} />
					}}
				</Field>
			</FormDataMolecule>
		)
	},
}
