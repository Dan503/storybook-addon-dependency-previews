import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import ButtonAtom, { type PropsForButtonAtom } from './ButtonAtom.vue'

const meta: Meta<typeof ButtonAtom> = {
	title: '01 Atoms / Button Atom',
	component: ButtonAtom,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		onClick: () => alert('Button clicked!'),
	} satisfies PropsForButtonAtom,
	render: (args) => ({
		components: { ButtonAtom },
		setup() {
			return { args }
		},
		template: `<ButtonAtom v-bind="args">Click me</ButtonAtom>`,
	}),
}
