import { Field, useForm } from '@formisch/react'
import { FormDataMolecule } from '../FormDataPreview/FormDataMolecule'
import { TextAreaMolecule } from './TextAreaMolecule'
import type { PropsForTextAreaMolecule } from './TextAreaMolecule'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
	defaultMessageOnlyValues,
	messageOnlySchema,
} from 'example-site-shared/data'

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
			schema: messageOnlySchema,
			initialInput: defaultMessageOnlyValues,
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
			schema: messageOnlySchema,
			initialInput: defaultMessageOnlyValues,
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
