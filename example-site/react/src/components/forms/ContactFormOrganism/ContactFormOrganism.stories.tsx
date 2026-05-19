import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { FormDataMolecule } from '../FormDataPreview/FormDataMolecule'
import { ContactFormOrganism } from './ContactFormOrganism'
import { onContactFormSubmit, useContactForm } from './useContactForm'

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
	render: () => {
		const form = useContactForm()

		return (
			<FormDataMolecule form={form}>
				<ContactFormOrganism form={form} onSubmit={onContactFormSubmit} />
			</FormDataMolecule>
		)
	},
}

export const ErrorState: Story = {
	render: () => {
		const form = useContactForm('initial')

		return (
			<FormDataMolecule form={form}>
				<ContactFormOrganism form={form} onSubmit={onContactFormSubmit} />
			</FormDataMolecule>
		)
	},
}
