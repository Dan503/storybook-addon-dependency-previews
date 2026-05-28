import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import MainNavMolecule, {
	type PropsForMainNavMolecule,
} from './MainNavMolecule.vue'

const meta: Meta<typeof MainNavMolecule> = {
	title: '02 Molecules / Main Nav Molecule',
	component: MainNavMolecule,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {} satisfies PropsForMainNavMolecule,
	render: (args) => ({
		components: { MainNavMolecule },
		setup() {
			return { args }
		},
		template: `<MainNavMolecule v-bind="args" />`,
	}),
}
