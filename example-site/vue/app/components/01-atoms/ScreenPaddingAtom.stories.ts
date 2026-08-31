import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import ScreenPaddingAtom, {
	type PropsForScreenPaddingAtom,
} from './ScreenPaddingAtom.vue'
import ChildContentAtom from '../zz-meta-components/ChildContentAtom.vue'

const meta: Meta<typeof ScreenPaddingAtom> = {
	title: '01 Atoms / Screen Padding Atom',
	component: ScreenPaddingAtom,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'fullscreen',
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {} satisfies PropsForScreenPaddingAtom,
	render: (args) => ({
		components: { ScreenPaddingAtom, ChildContentAtom },
		setup() {
			return { args }
		},
		template: `
<ScreenPaddingAtom v-bind="args">
	<ChildContentAtom />
</ChildContentAtom>`,
	}),
}

export const WithVerticalPadding: Story = {
	args: { padVertical: true } satisfies PropsForScreenPaddingAtom,
	render: (args) => ({
		components: { ScreenPaddingAtom, ChildContentAtom },
		setup() {
			return { args }
		},
		template: `
<ScreenPaddingAtom v-bind="args">
	<ChildContentAtom />
</ChildContentAtom>`,
	}),
}
