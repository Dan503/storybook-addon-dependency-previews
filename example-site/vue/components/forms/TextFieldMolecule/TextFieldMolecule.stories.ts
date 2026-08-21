import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import TextFieldMolecule, {
	type PropsForTextFieldMolecule,
} from './TextFieldMolecule.vue'
import TextFieldMoleculeDecorator from './TextFieldMolecule.decorator.vue'

const meta: Meta<typeof TextFieldMolecule> = {
	title: 'Forms / Text Field Molecule',
	// Storybook's Meta only accepts a plain component, and this one is written
	// with `generic="..."`, which Meta has no way to describe — so it is
	// rejected here despite working fine at runtime. TypeScript flags the
	// marker itself once Storybook can type it, so it cannot be left behind.
	// @ts-expect-error Meta cannot accept a component declared `generic="..."`
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
