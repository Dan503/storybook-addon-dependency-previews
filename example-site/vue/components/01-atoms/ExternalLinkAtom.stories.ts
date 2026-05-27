import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import ExternalLinkAtom, {
	type PropsForExternalLinkAtom,
} from './ExternalLinkAtom.vue'

const meta: Meta<typeof ExternalLinkAtom> = {
	title: '01 Atoms / External Link Atom',
	component: ExternalLinkAtom,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		href: 'https://www.example.com',
	} satisfies PropsForExternalLinkAtom,
	render: (args) => ({
		components: { ExternalLinkAtom },
		setup() {
			return { args }
		},
		template: `<ExternalLinkAtom v-bind="args">External link example</ExternalLinkAtom>`,
	}),
}
