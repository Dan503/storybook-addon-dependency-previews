import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { defaultContactFormValues } from 'example-site-shared/data'
import { FormDataMoleculeComponent } from './FormDataMolecule.component'

const meta: Meta<FormDataMoleculeComponent> = {
	title: 'Meta / Form Data Preview / Form Data Molecule',
	component: FormDataMoleculeComponent,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<FormDataMoleculeComponent>

export const Primary: Story = {
	args: { formValues: defaultContactFormValues },
}
