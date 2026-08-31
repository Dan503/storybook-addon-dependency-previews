import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import ErrorMessageAtom, {
	type PropsForErrorMessageAtom,
} from './ErrorMessageAtom.vue'

const meta: Meta<typeof ErrorMessageAtom> = {
	title: 'Forms / Error Messages / Error Message Atom',
	component: ErrorMessageAtom,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
	} satisfies StoryParameters,
	render: (args) => ({
		components: { ErrorMessageAtom },
		setup() {
			return { args }
		},
		template: `<ErrorMessageAtom v-bind="args" />`,
	}),
}

export default meta

type Story = StoryObj<typeof meta>

export const ErrorString: Story = {
	args: {
		error: 'This is an error message as a string',
	} satisfies PropsForErrorMessageAtom,
}

export const ErrorObject: Story = {
	args: {
		error: new Error('This is an error message as an Error() object'),
	} satisfies PropsForErrorMessageAtom,
}
