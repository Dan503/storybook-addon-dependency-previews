import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import FooterOrganism, {
	type PropsForFooterOrganism,
} from './FooterOrganism.vue'

const meta: Meta<typeof FooterOrganism> = {
	title: '03 Organisms / Footer Organism',
	component: FooterOrganism,
	tags: ['autodocs', 'organism'],
	parameters: {
		layout: 'padded',
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {} satisfies PropsForFooterOrganism,
	render: (args) => ({
		components: { FooterOrganism },
		setup() {
			return { args }
		},
		template: `<FooterOrganism v-bind="args" />`,
	}),
}
