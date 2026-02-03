import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
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
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {} satisfies PropsForContactFormOrganism,
	render: () => {
		const [formValues, setFormValues] = useState(defaultContactFormValues)

		return (
			<FormDataMolecule formValues={formValues}>
				<ContactFormOrganism
					onValuesChange={setFormValues}
					onSubmit={() =>
						alert(
							'Form submitted! with these values:\n' +
								JSON.stringify(formValues, null, 2),
						)
					}
				/>
			</FormDataMolecule>
		)
	},
}
