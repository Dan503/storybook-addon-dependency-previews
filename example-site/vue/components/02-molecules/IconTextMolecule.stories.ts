import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StoryParameters } from 'storybook-addon-dependency-previews'
import IconTextMolecule, {
	type PropsForIconTextMolecule,
} from './IconTextMolecule.vue'
import MapPinIcon from '../01-atoms/icons/MapPinIcon.vue'
import PhoneIcon from '../01-atoms/icons/PhoneIcon.vue'

const meta: Meta<typeof IconTextMolecule> = {
	title: '02 Molecules / Icon Text Molecule',
	component: IconTextMolecule,
	tags: ['autodocs', 'molecule'],
	parameters: {
		layout: 'padded',
	} satisfies StoryParameters,
}

export default meta

type Story = StoryObj<typeof meta>

export const MapPinText: Story = {
	args: {
		Icon: MapPinIcon,
	} satisfies PropsForIconTextMolecule,
	render: (args) => ({
		components: { IconTextMolecule },
		setup() {
			return { args }
		},
		template: `
<IconTextMolecule v-bind="args">
	123 Main St, Anytown, Australia
</IconTextMolecule>`,
	}),
}

export const PhoneText: Story = {
	args: {
		Icon: PhoneIcon,
	} satisfies PropsForIconTextMolecule,
	render: (args) => ({
		components: { IconTextMolecule },
		setup() {
			return { args }
		},
		template: `
<IconTextMolecule v-bind="args">
	0400 123 456
</IconTextMolecule>`,
	}),
}
