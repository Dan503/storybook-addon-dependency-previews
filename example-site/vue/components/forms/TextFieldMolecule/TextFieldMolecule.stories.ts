import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import TextFieldMolecule, {
	type PropsForTextFieldMolecule,
} from './TextFieldMolecule.vue'
import TextFieldMoleculeDecorator from './TextFieldMolecule.decorator.vue'

const meta: Meta<typeof TextFieldMolecule> = {
	title: 'Forms / Text Field Molecule',
	// This component is written with `generic="..."`, which compiles to a generic
	// function, and `Meta`'s `component` field only accepts a concrete component —
	// so it is rejected here despite working at runtime. TypeScript reports this
	// marker if the rejection ever stops, so it cannot be left behind once
	// Storybook can type these.
	// @ts-expect-error `Meta` cannot accept a component written with `generic="..."`
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
