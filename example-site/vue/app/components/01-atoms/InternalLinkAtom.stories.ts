import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import InternalLinkAtom, {
	type PropsForInternalLinkAtom,
} from './InternalLinkAtom.vue'

const meta: Meta<typeof InternalLinkAtom> = {
	title: '01 Atoms / Internal Link Atom',
	component: InternalLinkAtom,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		href: '/categories',
	} satisfies PropsForInternalLinkAtom,
	render: (args) => ({
		components: { InternalLinkAtom },
		setup() {
			return { args }
		},
		template: `<InternalLinkAtom v-bind="args">Food categories</InternalLinkAtom>`,
	}),
}
