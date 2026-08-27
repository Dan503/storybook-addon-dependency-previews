import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import ChildContentAtom from './ChildContentAtom.vue'

const meta: Meta<typeof ChildContentAtom> = {
	title: 'Zz Meta Components / Child Content Atom',
	component: ChildContentAtom,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'padded',
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	render: () => ({
		components: { ChildContentAtom },
		template: `<ChildContentAtom />`,
	}),
}
