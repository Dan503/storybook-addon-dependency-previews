import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import HeaderOrganism, { type PropsForHeaderOrganism } from './HeaderOrganism.vue'

const meta: Meta<typeof HeaderOrganism> = {
	title: '03 Organisms / Header Organism',
	component: HeaderOrganism,
	tags: ["autodocs","organism"],
	parameters: {
		layout: 'padded',
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {} satisfies PropsForHeaderOrganism,
	render: (args) => ({
		components: { HeaderOrganism },
		setup() {
			return { args }
		},
		template: `<HeaderOrganism v-bind="args" />`,
	}),
}
