import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { FormDataMolecule } from '../FormDataPreview/FormDataMolecule'
import {
	ContactFormOrganism,
	defaultContactFormValues,
	type PropsForContactFormOrganism,
} from './ContactFormOrganism'

const meta: Meta<typeof ContactFormOrganism> = {
	title: 'Forms / Contact Form Organism',
	component: ContactFormOrganism,
	tags: ['autodocs', 'organism'],
	parameters: {
		__filePath: import.meta.url,
	},
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {} satisfies PropsForContactFormOrganism,
	render: () => {
		const [formValues, setFormValues] = useState(defaultContactFormValues)

		return (
			<FormDataMolecule formValues={formValues}>
				<ContactFormOrganism onValuesChange={setFormValues} />
			</FormDataMolecule>
		)
	},
}
