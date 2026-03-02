import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { TextFieldMoleculeComponent } from './TextFieldMolecule.component'

const meta: Meta<TextFieldMoleculeComponent> = {
	title: 'Forms / Text Field Molecule',
	component: TextFieldMoleculeComponent,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<TextFieldMoleculeComponent>

export const Default: Story = {
	args: { label: 'Name', placeholder: 'Your name' },
}
