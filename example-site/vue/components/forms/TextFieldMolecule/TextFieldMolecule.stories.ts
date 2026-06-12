import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import TextFieldMolecule, {
	type PropsForTextFieldMolecule,
} from './TextFieldMolecule.vue'
import TextFieldMoleculeDecorator from './TextFieldMolecule.decorator.vue'

const meta: Meta<typeof TextFieldMolecule> = {
	title: 'Forms / Text Field Molecule',
	component: TextFieldMolecule,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
	} satisfies StoryParameters,
	render: (args) => ({
		components: { TextFieldMoleculeDecorator },
		setup() {
			return { args }
		},
		template: `<TextFieldMoleculeDecorator v-bind="args" />`,
	}),
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		label: 'First Name',
		placeholder: 'Enter your first name',
	} satisfies PropsForTextFieldMolecule,
}

export const ErrorState: Story = {
	args: {
		label: 'First Name',
		placeholder: 'Enter your first name',
	} satisfies PropsForTextFieldMolecule,
	render: (args) => ({
		components: { TextFieldMoleculeDecorator },
		setup() {
			return { args }
		},
		template: `<TextFieldMoleculeDecorator v-bind="args" validate="initial" />`,
	}),
}
