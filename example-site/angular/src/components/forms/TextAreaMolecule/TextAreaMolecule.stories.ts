import type { Meta, StoryObj } from '@storybook/angular'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import { TextAreaMoleculeComponent } from './TextAreaMolecule.component'

const meta: Meta<TextAreaMoleculeComponent> = {
	title: 'Forms / Text Area Molecule',
	component: TextAreaMoleculeComponent,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<TextAreaMoleculeComponent>

export const Primary: Story = {
	args: { label: 'Message', placeholder: 'Type your message here...' },
}
