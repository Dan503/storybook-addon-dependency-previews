import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import ContentRestraintAtom, {
	type PropsForContentRestraintAtom,
} from './ContentRestraintAtom.vue'
import ChildContentAtom from '../zz-meta-components/ChildContentAtom.vue'

const meta: Meta<typeof ContentRestraintAtom> = {
	title: '01 Atoms / Content Restraint Atom',
	component: ContentRestraintAtom,
	tags: ['autodocs', 'atom'],
	parameters: {
		layout: 'fullscreen',
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {} satisfies PropsForContentRestraintAtom,
	render: (args) => ({
		components: { ContentRestraintAtom, ChildContentAtom },
		setup() {
			return { args }
		},
		template: `
<ContentRestraintAtom v-bind="args">
	<ChildContentAtom />
</ContentRestraintAtom>`,
	}),
}

export const WithVerticalPadding: Story = {
	args: { padVertical: true } satisfies PropsForContentRestraintAtom,
	render: (args) => ({
		components: { ContentRestraintAtom, ChildContentAtom },
		setup() {
			return { args }
		},
		template: `
<ContentRestraintAtom v-bind="args">
	<ChildContentAtom />
</ContentRestraintAtom>`,
	}),
}
