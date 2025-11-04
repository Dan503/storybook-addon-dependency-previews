import type { Meta, StoryObj } from '@storybook/react-vite'
import {
	IconTextMolecule,
	type PropsForIconTextMolecule,
} from './IconTextMolecule'
import { MapPinIcon } from '../01-atoms/icons/MapPinIcon'
import { PhoneIcon } from '../01-atoms/icons/PhoneIcon'

const meta: Meta<typeof IconTextMolecule> = {
	title: 'Molecules / Icon Text Molecule',
	component: IconTextMolecule,
	tags: ['autodocs', 'molecule'],
	parameters: {
		__filePath: import.meta.url,
	},
}

export default meta

type Story = StoryObj<typeof meta>

export const MapPin: Story = {
	args: {
		Icon: MapPinIcon,
		children: '123 Main St, Anytown, Australia',
	} satisfies PropsForIconTextMolecule,
}

export const Phone: Story = {
	args: {
		Icon: PhoneIcon,
		children: '0412 345 678',
	} satisfies PropsForIconTextMolecule,
}
