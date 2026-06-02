import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import ErrorListMolecule, {
	type PropsForErrorListMolecule,
} from './ErrorListMolecule.vue'

const meta: Meta<typeof ErrorListMolecule> = {
	title: 'Forms / Error Messages / Error List Molecule',
	component: ErrorListMolecule,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
	} satisfies StoryParameters,
	render: (args) => ({
		components: { ErrorListMolecule },
		setup() {
			return { args }
		},
		template: `<ErrorListMolecule v-bind="args" />`,
	}),
}

export default meta

type Story = StoryObj<typeof meta>

const errorStrings = ['Error One', 'Second error']

export const ErrorStrings: Story = {
	args: {
		errors: errorStrings,
	} satisfies PropsForErrorListMolecule,
}

export const ErrorObjects: Story = {
	args: {
		errors: errorStrings.map((err) => new Error(err)),
	} satisfies PropsForErrorListMolecule,
}
