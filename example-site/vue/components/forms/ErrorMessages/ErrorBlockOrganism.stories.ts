import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import ErrorBlockOrganism, {
	type PropsForErrorBlockOrganism,
} from './ErrorBlockOrganism.vue'

const meta: Meta<typeof ErrorBlockOrganism> = {
	title: 'Forms / Error Messages / Error Block Organism',
	component: ErrorBlockOrganism,
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'padded',
	} satisfies StoryParameters,
	render: (args) => ({
		components: { ErrorBlockOrganism },
		setup() {
			return { args }
		},
		template: `<ErrorBlockOrganism v-bind="args" />`,
	}),
}

export default meta

type Story = StoryObj<typeof meta>

const errorStrings = ['Error One', 'Second error']

export const ErrorStrings: Story = {
	args: {
		errors: errorStrings,
	} satisfies PropsForErrorBlockOrganism,
}

export const ErrorObjects: Story = {
	args: {
		errors: errorStrings.map((err) => new Error(err)),
	} satisfies PropsForErrorBlockOrganism,
}

export const NoErrorsEmptyArray: Story = {
	name: 'No Errors (empty array)',
	args: {
		errors: [],
	} satisfies PropsForErrorBlockOrganism,
}

export const NoErrorsNull: Story = {
	name: 'No Errors (null)',
	args: {
		errors: null,
	} satisfies PropsForErrorBlockOrganism,
}
