import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import TextAreaMolecule, {
	type PropsForTextAreaMolecule,
} from './TextAreaMolecule.vue'
import TextAreaMoleculeDecorator from './TextAreaMolecule.decorator.vue'

const meta: Meta<typeof TextAreaMolecule> = {
	title: 'Forms / Text Area Molecule',
	// Storybook's Meta only accepts a plain component, and this one is written
	// with `generic="..."`, which Meta has no way to describe — so it is
	// rejected here despite working fine at runtime. TypeScript flags the
	// marker itself once Storybook can type it, so it cannot be left behind.
	// @ts-expect-error Meta cannot accept a component declared `generic="..."`
	component: TextAreaMolecule,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
	} satisfies StoryParameters,
	render: (args) => ({
		components: { TextAreaMoleculeDecorator },
		setup() {
			return { args }
		},
		template: `<TextAreaMoleculeDecorator v-bind="args" />`,
	}),
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		label: 'Message',
		placeholder: 'Enter your message',
	} satisfies PropsForTextAreaMolecule,
}

export const ErrorState: Story = {
	args: {
		label: 'Message',
		placeholder: 'Enter your message',
	} satisfies PropsForTextAreaMolecule,
	render: (args) => ({
		components: { TextAreaMoleculeDecorator },
		setup() {
			return { args }
		},
		template: `<TextAreaMoleculeDecorator v-bind="args" validate="initial" />`,
	}),
}
