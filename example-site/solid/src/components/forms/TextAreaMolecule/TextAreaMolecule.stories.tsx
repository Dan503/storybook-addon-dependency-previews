import { Field, createForm } from '@formisch/solid'
import { FormDataMolecule } from '../FormDataPreview/FormDataMolecule'
import { TextAreaMolecule } from './TextAreaMolecule'
import type { PropsForTextAreaMolecule } from './TextAreaMolecule'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import type { Meta } from 'storybook-solidjs-vite'
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

export const Primary = {
	args: {
		label: 'Your message',
		placeholder: 'Type your message here...',
	} satisfies PropsForTextAreaMolecule,
	render: (args: PropsForTextAreaMolecule) => {
		const form = createForm({
			schema: messageOnlySchema,
			initialInput: defaultMessageOnlyValues,
		})

		return (
			<FormDataMolecule form={form}>
				<Field of={form} path={['message']}>
					{(field) => <TextAreaMolecule {...args} field={field} />}
				</Field>
			</FormDataMolecule>
		)
	},
}

export const ErrorState = {
	args: {
		label: 'Your message',
		placeholder: 'Type your message here...',
	} satisfies PropsForTextAreaMolecule,
	render: (args: PropsForTextAreaMolecule) => {
		const form = createForm({
			schema: messageOnlySchema,
			initialInput: defaultMessageOnlyValues,
			validate: 'initial',
		})

		return (
			<FormDataMolecule form={form}>
				<Field of={form} path={['message']}>
					{(field) => <TextAreaMolecule {...args} field={field} />}
				</Field>
			</FormDataMolecule>
		)
	},
}
