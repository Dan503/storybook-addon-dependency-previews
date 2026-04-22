import {
	contactFormSchema,
	defaultContactFormValues,
} from 'example-site-shared/data'
import { useForm } from '@formisch/react'
import { FormDataMolecule } from '../FormDataPreview/FormDataMolecule'
import { ContactFormOrganism } from './ContactFormOrganism'
import type { PropsForContactFormOrganism } from './ContactFormOrganism'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof ContactFormOrganism> = {
	title: 'Forms / Contact Form Organism',
	component: ContactFormOrganism,
	tags: ['autodocs', 'organism'],
	parameters: {
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		onSubmit: (values) =>
			alert(
				'Form submitted! with these values:\n' +
					JSON.stringify(values, null, 2),
			),
	} satisfies Omit<PropsForContactFormOrganism, 'form'>,
	render: ({ onSubmit }) => {
		const form = useForm({
			schema: contactFormSchema,
			initialInput: defaultContactFormValues,
		})

		return (
			<FormDataMolecule form={form}>
				<ContactFormOrganism form={form} onSubmit={onSubmit} />
			</FormDataMolecule>
		)
	},
}

export const ErrorState: Story = {
	args: {
		onSubmit: (values) =>
			alert(
				'Form submitted! with these values:\n' +
					JSON.stringify(values, null, 2),
			),
	} satisfies Omit<PropsForContactFormOrganism, 'form'>,
	render: ({ onSubmit }) => {
		const form = useForm({
			schema: contactFormSchema,
			initialInput: defaultContactFormValues,
			validate: 'initial',
		})

		return (
			<FormDataMolecule form={form}>
				<ContactFormOrganism form={form} onSubmit={onSubmit} />
			</FormDataMolecule>
		)
	},
}
